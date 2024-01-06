package app.omnivore.omnivore.ui.editinfo

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.Constants
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.R
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.graphql.generated.UpdatePageMutation
import app.omnivore.omnivore.graphql.generated.type.UpdatePageInput
import app.omnivore.omnivore.ui.ResourceProvider
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.Optional
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import javax.inject.Inject

enum class EditInfoState {
  DEFAULT,
  UPDATING,
  ERROR,
  UPDATED
}

@HiltViewModel
class EditInfoViewModel @Inject constructor(
  private val dataService: DataService,
  private val datastoreRepo: DatastoreRepository,
  private val resourceProvider: ResourceProvider
) : ViewModel() {
  val state = MutableLiveData(EditInfoState.DEFAULT)

  var isLoading by mutableStateOf(false)
    private set

  var message by mutableStateOf<String?>(null)
    private set

  private fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken)
  }

  fun editInfo(itemId: String, title: String, author: String?, description: String?) {
    viewModelScope.launch {
      isLoading = true
      state.postValue(EditInfoState.UPDATING)

      val authToken = getAuthToken()

      if (authToken == null) {
        message = resourceProvider.getString(R.string.edit_info_view_model_error_not_logged_in)
        isLoading = false
        return@launch
      }

      val apolloClient = ApolloClient.Builder()
        .serverUrl("${Constants.apiURL}/api/graphql")
        .addHttpHeader("Authorization", value = authToken)
        .build()

      try {
        val response = apolloClient.mutation(
          UpdatePageMutation(
            UpdatePageInput(
              pageId = itemId,
              title = Optional.present(title),
              byline = Optional.presentIfNotNull(author),
              description = Optional.presentIfNotNull(description)
            )
          )
        ).execute()

        withContext(Dispatchers.IO) {
          val savedItem = dataService.db.savedItemDao().findById(itemId) ?: return@withContext
          val updatedSavedItem = savedItem.copy(title = title, author = author, descriptionText = description)
          dataService.db.savedItemDao().update(updatedSavedItem)
        }

        isLoading = false

        val success = (response.data?.updatePage?.onUpdatePageSuccess?.updatedPage != null)
        if (success) {
          message = resourceProvider.getString(R.string.edit_info_sheet_success)
          state.postValue(EditInfoState.UPDATED)
        } else {
          message = resourceProvider.getString(R.string.edit_info_sheet_error)
          state.postValue(EditInfoState.ERROR)
        }
      } catch (e: java.lang.Exception) {
        message = resourceProvider.getString(R.string.edit_info_sheet_error)
        state.postValue(EditInfoState.ERROR)
      }
    }
  }

  fun resetState() {
    state.postValue(EditInfoState.DEFAULT)
  }
}
