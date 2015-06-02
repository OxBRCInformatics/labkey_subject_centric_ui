'use strict';

var _ = require('lodash');
module.exports = ParticipantRecord;

function ParticipantRecord(ParticipantService, DatasetMetadataService) {
    return {
      scope: {
        participant: '='
      },
      templateUrl: '../../labking/js/participantFilter/participantRecord.directive.html',

      controllerAs: 'vm',
      bindToController: true,
      controller: function($modal) {
        var self = this;

        self.selectedCategory = {};
        self.selectedDataSet = {};
        self.canAddEntries = canAddEntries;
        self.openEditModal = openEditModal;
        self.getEnrolmentDataSet = getEnrolmentDataSet;
        self.getParticipantName = getParticipantName;
        self.selectCategory = selectCategory;
        self.selectDataSet = selectDataSet;

        DatasetMetadataService.getMetaData().then(function(metadata) {

          self.metadata = _.sortBy(metadata, 'DisplayOrder').filter(function(dataSet) { return dataSet.ShowByDefault; });
          self.categories = _.groupBy(self.metadata, function(dataset) {
            return dataset['CategoryId/Label'];
          });
          selectCategory(self.categories[_.keys(self.categories)[0]]);
        });

        DatasetMetadataService.getLookups().then(function(lookups) {
          self.lookups = lookups;
        });



        // Utility to get at demographic data for the headers
        function getEnrolmentDataSet() {
          if(self.participant && self.participant.dataSets){
            return self.participant.dataSets.Database_Enrollment[0];
          }else{
            return {};
          }
        };

        function getParticipantName() {
          return `${self.getEnrolmentDataSet().FirstName} ${self.getEnrolmentDataSet().LastName}`;
        };

        function selectCategory(category) {
          self.selectedCategory = category;
          selectDataSet(self.selectedCategory[0]);
        };

        function selectDataSet(dataSet) {
          self.selectedDataSet = dataSet;
        };

        function canAddEntries() {
          return !(self.selectedDataSet && self.selectedDataSet.DemographicData &&
                  self.participant && self.participant.dataSets[self.selectedDataSet.Name].length);
        }

        function openEditModal(create=true) {
          var modalInstance = $modal.open({
            animation: true,
            templateUrl: '../../labking/js/participantFilter/datasetEditModal.html',
            controller: 'DatasetEditModalController as vm',
            resolve: {
              isCreate: function () {
                return create;
              },
              selectedDataset: function () {
                return self.selectedDataSet;
              },
              lookups: function () {
                return DatasetMetadataService.getLookups();
              },
            }
          });

          modalInstance.result.then(function (entry) {
            entry.ParticipantId = self.participant.ParticipantId;

            return ParticipantService.createRecord(self.selectedDataSet.Name, entry)

          });
        }
      }
    };
  }
