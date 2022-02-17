import express from 'express'
import { env } from '../../env'
import * as jwt from 'jsonwebtoken'
import { PageType, UploadFileStatus } from '../../generated/graphql'
import {
  generateUploadFilePathName,
  generateUploadSignedUrl,
  getStorageFileDetails,
  makeStorageFilePublic,
} from '../../utils/uploads'
import { initModels } from '../../server'
import { kx } from '../../datalayer/knex_config'
import { analytics } from '../../utils/analytics'
import { getNewsletterEmail } from '../../services/newsletters'
import { setClaims } from '../../datalayer/helpers'

export function pdfAttachmentsRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/upload', async (req, res) => {
    console.log('pdf-attachments/upload')

    const { email, fileName } = req.body as {
      email: string
      fileName: string
    }

    const token = req?.headers?.authorization
    if (!token || !jwt.verify(token, env.server.jwtSecret)) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const newsletterEmail = await getNewsletterEmail(email)
    if (!newsletterEmail || !newsletterEmail.user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const user = newsletterEmail.user

    analytics.track({
      userId: user.id,
      event: 'pdf-attachment-upload',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const contentType = 'application/pdf'
      const models = initModels(kx, false)
      const uploadFileData = await models.uploadFile.create({
        url: '',
        userId: user.id,
        fileName: fileName,
        status: UploadFileStatus.Initialized,
        contentType: contentType,
      })

      if (uploadFileData.id) {
        const uploadFilePathName = generateUploadFilePathName(
          uploadFileData.id,
          fileName
        )
        const uploadSignedUrl = await generateUploadSignedUrl(
          uploadFilePathName,
          contentType
        )
        res.send({
          id: uploadFileData.id,
          url: uploadSignedUrl,
        })
      } else {
        res.status(400).send('BAD REQUEST')
      }
    } catch (err) {
      console.error(err)
      return res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/create-article', async (req, res) => {
    console.log('pdf-attachments/create-article')

    const { email, uploadFileId, subject } = req.body as {
      email: string
      uploadFileId: string
      subject: string
    }

    const token = req?.headers?.authorization
    if (!token || !jwt.verify(token, env.server.jwtSecret)) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const newsletterEmail = await getNewsletterEmail(email)
    if (!newsletterEmail || !newsletterEmail.user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const user = newsletterEmail.user

    analytics.track({
      userId: user.id,
      event: 'pdf-attachment-create-article',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const models = initModels(kx, false)
      const uploadFile = await models.uploadFile.getWhere({
        id: uploadFileId,
        userId: user.id,
      })
      if (!uploadFile) {
        return res.status(400).send('BAD REQUEST')
      }

      const uploadFileDetails = await getStorageFileDetails(
        uploadFileId,
        uploadFile.fileName
      )
      const uploadFileHash = uploadFileDetails.md5Hash
      const pageType = PageType.File

      const saveTime = new Date()
      const articleToSave = {
        url: '',
        pageType: pageType,
        hash: uploadFileHash,
        uploadFileId: uploadFileId,
        title: subject || uploadFile.fileName,
        content: '',
      }

      const uploadFileData = await kx.transaction(async (tx) => {
        await setClaims(tx, user.id)
        return models.uploadFile.setFileUploadComplete(uploadFileId, tx)
      })
      if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
        return res.status(400).send('BAD REQUEST')
      }

      const uploadFileUrlOverride = await makeStorageFilePublic(
        uploadFileData.id,
        uploadFileData.fileName
      )

      const link = await kx.transaction(async (tx) => {
        await setClaims(tx, user.id)
        const articleRecord = await models.article.create(articleToSave, tx)
        return models.userArticle.create(
          {
            userId: user.id,
            slug: '',
            savedAt: saveTime,
            articleId: articleRecord.id,
            articleUrl: uploadFileUrlOverride,
            articleHash: articleRecord.hash,
          },
          tx
        )
      })
      res.send({ id: link.id })
    } catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  })

  return router
}
