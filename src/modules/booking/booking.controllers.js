angular.module('booking.controllers', [])
    .controller('bookingCtrl', ['$scope', '$state', 'onlineBookingAPIFactory', 'currentBooking', 'sessionService',
      function($scope, $state, onlineBookingAPIFactory, currentBooking, sessionService){
        $scope.currentBooking = currentBooking;
        $scope.business = sessionService.business;
        $scope.limitedSpace = false;

        $scope.selectEvent = function (event) {
            if($scope.selectedEvent !== event){
                currentBooking.resetBooking()
                $scope.selectedEvent = event;
                if(event.sessions){
                    $scope.availableSessions = _.filter(event.sessions, function(session){
                        return !$scope.isBefore(session) && $scope.getSessionSpacesAvailable(session) > 0
                    });
                } else {
                    $scope.availableSessions = [event];
                }
                if(!event.sessions || (event.pricing.coursePrice && !event.pricing.sessionPrice)) $scope.toggleEntireCourse();
            }
        };

        $scope.closeEvent = function(){
            event.stopPropagation();
            currentBooking.resetBooking();
            delete $scope.selectedEvent;
        };

        $scope.toggleSessionSelect = function(session){
            if(_.includes(currentBooking.booking.sessions, session)){
                currentBooking.booking.sessions = _.without(currentBooking.booking.sessions, session);
            } else {
                currentBooking.booking.sessions.push(session);
            }

            if($scope.entireCourseSelected()){
                currentBooking.booking.course = $scope.selectedEvent;
            } else {
                currentBooking.booking.course = null;
            }
        };

        $scope.entireCourseSelected = function(){
            return _.size(currentBooking.booking.sessions) === _.size($scope.availableSessions);
        }

        //TODO don't set course if all arent available?
        $scope.toggleEntireCourse = function(){
            if($scope.entireCourseSelected()){
                currentBooking.resetBooking();
            } else {
                currentBooking.booking.sessions = $scope.availableSessions;
                currentBooking.booking.course = $scope.selectedEvent;
            }
        };

        $scope.getSessionSpacesAvailable = function(session){
            var spacesAvailable = session.booking.studentCapacity - session.booking.bookingCount;
            return spacesAvailable > 0 ? spacesAvailable : 0;
        };

        $scope.isBefore = function(session){
            return moment(session.timing.startDate + " " + session.timing.startTime, "YYYY-MM-DD HH:mm").isBefore(moment().add(3, 'h'));
        };
    }])
    .controller('bookingSelectionCtrl', ['$scope', 'anonCoachseekAPIFactory', 'currentBooking',
      function($scope, anonCoachseekAPIFactory, currentBooking){
        var locationEvents,
            serviceEvents,
            allEvents;

        $scope.locations = [];
        $scope.services = [];

        $scope.$watch('currentBooking.filters.service', function(newService){
            if(_.size(newService)){
                $scope.loadingSessions = true;
                anonCoachseekAPIFactory.anon($scope.business.domain).get({section: 'Services', id: newService.id})
                    .$promise.then(function(service){
                        $scope.serviceDescription = service.description;
                    }, $scope.handleErrors).finally(function(){
                        $scope.loadingSessions = false;
                });
            }
        });

        $scope.filterByLocation = function (resetBooking) {
            if(resetBooking){
                currentBooking.resetBooking();
                delete currentBooking.filters.service;
            }

            delete $scope.selectedEvent;
            delete $scope.serviceDescription;

            locationEvents = _.filter(currentBooking.allEvents, function(event){
                return event.location.id === $scope.currentBooking.filters.location.id;
            });
            $scope.services = [];
            _.each(locationEvents, function(event){
                if(!serviceAlreadyAdded(event.service.id)) {
                    $scope.services.push(event.service);
                }
            });
            filterEvents();
        };

        $scope.filterByService = function (resetBooking) {
            if(resetBooking) currentBooking.resetBooking();
            delete $scope.selectedEvent;
            delete $scope.serviceDescription;

            serviceEvents = _.filter(currentBooking.allEvents, function(event){
                return event.service.id === $scope.currentBooking.filters.service.id;
            });
            filterEvents();
        };


        function filterEvents(){
            $scope.events = _.intersection(locationEvents, serviceEvents)
        };

        $scope.disableContinue = function(){
            return _.isEmpty(currentBooking.booking.sessions);
        }

        function serviceAlreadyAdded(serviceId){
            return _.find($scope.services, function(service){
                return service.id === serviceId
            });
        };

        function locationAlreadyAdded(locationId){
            return _.find($scope.locations, function(location){
                return location.id === locationId
            });
        };

        function getNewDate(timing){
            return moment(timing.startDate + " " + timing.startTime, "YYYY-MM-DD HH:mm");
        };

        function buildLocationsAndServices(){
            _.each(currentBooking.allEvents, function(event){
                if(!locationAlreadyAdded(event.location.id)) {
                    $scope.locations.push(event.location);
                }

                if(!serviceAlreadyAdded(event.service.id)) {
                    $scope.services.push(event.service);
                }
            });
        };

        function removeSessionsInPast(sessions){
            return _.filter(sessions, function(session){
                return getNewDate(session.timing).isAfter(moment().add(3, 'h'));
            });
        };

        function removeCoursesInPast(courses){
            return _.filter(courses, function(course){
                return !_.every(course.sessions, function(session){
                    return getNewDate(session.timing).isBefore(moment().add(3, 'h'));
                })
            });
        };

        if(!currentBooking.allEvents){
            delete $scope.serviceDescription;
            $scope.loadingSessions = true;            
            currentBooking.getAllEvents($scope.business.domain).then(function(events){
                currentBooking.allEvents = _.sortBy(_.union(removeCoursesInPast(events.courses), removeSessionsInPast(events.sessions)),function(event){
                    return getNewDate(event.timing).valueOf();
                });
                $scope.eventsExist = _.size(currentBooking.allEvents);
                buildLocationsAndServices();
            }, $scope.handleErrors).finally(function(){
                $scope.loadingSessions = false;
            });
        } else {
            $scope.eventsExist = _.size(currentBooking.allEvents);
            buildLocationsAndServices();
            $scope.filterByLocation();
            $scope.filterByService();
        }
    }])
    .controller('bookingCustomerDetailsCtrl', ['$scope', '$q', '$state', 'currentBooking', 'onlineBookingAPIFactory', 
      function($scope, $q, $state, currentBooking, onlineBookingAPIFactory){
        if(!currentBooking.filters.location){
            $state.go('booking.selection');
        }

        $scope.getCustomer = function(){
            $scope.processingBooking = true;
            $q.all({
                customer: onlineBookingAPIFactory.anon($scope.business.domain).save({ section: 'Customers' }, currentBooking.customer).$promise,
                customerNotes: onlineBookingAPIFactory.anon($scope.business.domain).getCustomFields({}).$promise
            }).then(function(response) {
                    currentBooking.customerId = response.customer.id;
                    currentBooking.customFields = response.customer.customFields;
                    currentBooking.customerNotes = _.filter(response.customerNotes, function(note) { return note.isActive; });

                    if(_.size(currentBooking.customerNotes)){
                        $state.go('booking.notes');
                    } else {
                        $state.go('booking.confirmation');
                    }
                }, function(error){
                    $scope.processingBooking = false;
                    $scope.handleErrors(error);
                });
        } 
    }])
    .controller('bookingCustomerNotesCtrl', ['$scope', '$state', 'currentBooking', 'onlineBookingAPIFactory', 
      function($scope, $state, currentBooking, onlineBookingAPIFactory){
        if(!currentBooking.filters.location){
            $state.go('booking.selection');
        }
        $scope.fields = _.keyBy(currentBooking.customFields, 'key');

        $scope.saveCustomerNotes = function(){
            $scope.processingBooking = true;
            onlineBookingAPIFactory.anon($scope.business.domain)
                .save({ section: 'Customers', id: currentBooking.customerId }, {customFields: getCustomFieldsArray()}).$promise
                    .then(function (customer) {
                        $state.go('booking.confirmation');
                }, function(error){
                    $scope.processingBooking = false;
                    $scope.handleErrors(error);
                });
        }

        function getCustomFieldsArray(){
            _.each($scope.fields, function(field, key){
                field.key = key;
            });
            return _.values($scope.fields);
        }
    }])
    .controller('bookingConfirmationCtrl', ['$scope', '$q', '$state', '$location', '$sce', 'onlineBookingAPIFactory', 'currentBooking', 'sessionService', 'ENV',
      function($scope, $q, $state, $location, $sce, onlineBookingAPIFactory, currentBooking, sessionService, ENV){
        $scope.bookingConfirmed = false;
        $scope.paidWithPaypal = false;
        $scope.paypalURL = $sce.trustAsResourceUrl($scope.ENV.paypalURL);

        if( sessionService.currentBooking ){
            _.assign(currentBooking, {
                customer: sessionService.currentBooking.customer,
                filters: sessionService.currentBooking.filters,
                totalPrice: sessionService.currentBooking.totalPrice,
                dateRange: sessionService.currentBooking.dateRange
            });
            delete sessionService.currentBooking;
            $scope.bookingConfirmed = true;
            $scope.paidWithPaypal = true;
        } else if( !currentBooking.filters.location ){
            $state.go('booking.selection');
        }

        $scope.processBooking = function (payLater) {
            $scope.processingBooking = true;
            return onlineBookingAPIFactory.anon($scope.business.domain)
                .pricingEnquiry({}, {sessions: currentBooking.booking.sessions}).$promise
                    .then(function(response){
                        currentBooking.totalPrice = parseFloat(response.price).toFixed(2);
                        _.assign(currentBooking.customer, {id: currentBooking.customerId})
                        return saveBooking(currentBooking.customer).then(function (booking) {
                            currentBooking.booking.id = booking.id;
                            $scope.bookingConfirmed = payLater;
                            $scope.redirectingToPaypal = !payLater;
                        }, function(error){
                            $scope.handleErrors(error);
                            // make sure paypal form doesn't submit if error;
                            return $q.reject();
                        }).finally(function(){
                            $scope.processingBooking = false;
                        });
                }, function(error){
                    $scope.handleErrors(error);
                    // make sure paypal form doesn't submit if error;
                    return $q.reject();
                }).finally(function(){
                    $scope.processingBooking = false;
                });
        };

        function saveBooking(customer){
            return onlineBookingAPIFactory.anon($scope.business.domain)
                    .save({ section: 'Bookings' }, {sessions: currentBooking.booking.sessions, customer: customer}).$promise;
        };

        $scope.resetBookings = function () {
            currentBooking.resetBooking();
            currentBooking.filters = {};
            delete currentBooking.totalPrice;
            delete currentBooking.dateRange;
            delete currentBooking.allEvents;
            $state.go('booking.selection');
        };
    }])
    .controller('bookingAdminCtrl', ['$scope', '$templateCache', '$compile', '$timeout', 'coachSeekAPIService', '$activityIndicator', 'sessionService',
      function($scope, $templateCache, $compile, $timeout, coachSeekAPIService, $activityIndicator, sessionService){
        var markup = $templateCache.get('booking/partials/bookNowButton.html'),
            view = $compile(markup)($scope),
            businessCopy = angular.copy(sessionService.business);

        $scope.saved = true;
        $scope.initNoteLoad = true;

        $scope.getSaveButtonState = function(){
            if($scope.AILoading){
                return 'saving'
            } else if ($scope.saved) {
                return 'saved'
            } else {
                return 'save-details'
            }
        };

        $scope.cancelEdit = function(){
            $scope.business = angular.copy(businessCopy);
            _.defer(function(){
                $scope.saved = true;
                $scope.$apply()
            });
        };

        $scope.$watch('business.payment', function(newVal, oldVal){
            if(newVal && oldVal && newVal !== oldVal){
                $scope.saved = false;
                if(newVal.isOnlinePaymentEnabled === false && businessCopy.payment.isOnlinePaymentEnabled !== false) {
                    $scope.save();
                }

                if(oldVal.useProRataPricing !== newVal.useProRataPricing){
                    savePaymentDebounce();
                }
            }
        }, true);

        $scope.save = function(){
            $activityIndicator.startAnimating();
            coachSeekAPIService.save({section: "Business"}, $scope.business).$promise
                .then(function(){
                    sessionService.business = $scope.business;
                    businessCopy = angular.copy($scope.business);
                    $scope.saved = true;
                }, $scope.handleErrors).finally(function(){
                    $scope.cancelEdit();
                    $activityIndicator.stopAnimating();
                });
        };

        var savePaymentDebounce = _.debounce($scope.save, 1000);

        $timeout(function(){
            $scope.buttonHTML = view.get(0).outerHTML;
            $scope.$apply();
        });

        $scope.$watch('activeTab', function(newVal){
            if(newVal){
                $scope.business = angular.copy(businessCopy);
                $scope.business.payment.paymentProvider = "PayPal";
            }
        });

        $scope.$on('$stateChangeStart', function () {
            $scope.business = angular.copy(businessCopy);
        });

        $scope.shareToFacebook = function(){
            FB.ui({
                method: 'feed',
                name: i18n.t("booking:booking-admin.facebook-share-name"),
                link: 'https://'+$scope.business.domain +($scope.ENV.name === 'dev' ? '.testing' : '')+ '.coachseek.com',
                picture: 'https://az789256.vo.msecnd.net/assets/'+$scope.ENV.version+'/pics/facebook-share.png',
                caption: i18n.t("booking:booking-admin.facebook-share-caption"),
                description: i18n.t("booking:booking-admin.facebook-share-description")
            });
        }

        //TODO validate form, sort by filter
        var newNoteDefaults = {
            type: 'customer',
            name: '',
            isRequired: false,
        };
        $scope.newNote = angular.copy(newNoteDefaults);
        $scope.showAddNote = false;
        $scope.saveNewNote = function(){
            //check form valid
            // must do $childHead here because ng-switch creates a new scope. lame.
            if($scope.$$childHead.newNoteNameForm.$valid){
                $activityIndicator.startAnimating();
                coachSeekAPIService.save({section: 'CustomFields'}, $scope.newNote).$promise
                    .then(function(note){
                        $scope.bookingNotes.unshift(note);
                        $scope.newNote = angular.copy(newNoteDefaults);
                        $scope.showAddNote = false;
                    }, $scope.handleErrors).finally(function(){
                        $activityIndicator.stopAnimating();
                    });
            }
        };

        $scope.addNoteShow = function(){
            $scope.showAddNote = true;
        }

        $scope.addNoteHide = function(){
            $scope.showAddNote = false;
        }

        coachSeekAPIService.query({section: 'CustomFields', type: 'customer'})
            .$promise.then(function(bookingNotes){
                $scope.bookingNotes = bookingNotes;
            }, $scope.handleErrors).finally(function(){
                $scope.initNoteLoad = false;
            });
    }]);