'use strict';

module.exports = DatasetEditModalController;

/**
 * Controller for the dataset editor Bootstrap modal.
 *
 * @param DatasetMetadataService the injected service to provide lookups.
 * @param $modalInstance the associated modal.
 * @param participantId the ID of the participant this record belongs to.
 * @param entry the entry to edit, or undefined if a new entry is being created.
 * @param selectedDataset the metadata for the entry.
 * @param lookups the options for `select` elements.
 * @param onSave the function to call when the form is submitted. This function must take the parameters `datasetName, record`.
 * @ngInject
 **/
function DatasetEditModalController(DatasetMetadataService, $modalInstance, participantId, entry, selectedDataset, onSave) {
  var self = this;

  self.lookups = {};

  self.editTypeLabel = 'Edit';
  self.entry = entry;
  self.dataset = selectedDataset;
  self.onSave = onSave;

  self.submit = submit;
  self.cancel = cancel;

  activate();


  function activate(){
    self.dataset.columns
      .filter(function(column) {
        return !!column.LookupQuery;
      })
      .forEach(function (column) {
        var lookupQuery = column.LookupQuery;
        DatasetMetadataService.getLookups(lookupQuery)
          .then(function (lookup) {
            self.lookups[lookupQuery] = lookup;
          });
      });

    if(entry === undefined || entry === {}){
      self.editTypeLabel = 'Create';
      self.entry = {
        ParticipantId: participantId
      };
    }
  }

  function submit() {
    self.entry.date = self.entry.Date;
    onSave(self.dataset.Name, self.entry).then($modalInstance.close);
  }

  function cancel() {
    $modalInstance.dismiss('cancel');
  }
}
