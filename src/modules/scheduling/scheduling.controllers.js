angular.module('scheduling.controllers', [])
    .controller('schedulingCtrl', ['$scope', '$q', '$state', '$timeout', 'sessionService', 'coachSeekAPIService', '$activityIndicator', 'sessionOrCourseModal', 'serviceDefaults', 'uiCalendarConfig','$compile','$templateCache', 'onboardingModal', 'currentEventService',
        function($scope, $q, $state, $timeout, sessionService, coachSeekAPIService, $activityIndicator, sessionOrCourseModal, serviceDefaults, uiCalendarConfig,$compile,$templateCache, onboardingModal, currentEventService){
            $scope.events = [];
            $scope.calendarView = sessionService.calendarView;

            var tempEventId,
                currentEventCopy,
                $currentEvent,
                totalNumSessions,
                copyEventDrag;

            $scope.draggableOptions = {
                helper: function(event) {
                    var serviceData = $(this).data('service');
                    return $('<span class="service-drag-helper ' + serviceData.presentation.colour + '">' + serviceData.name + '<span/>');
                },
                cursorAt: {
                    top: 15,
                    left: 45
                }
            };

            $scope.toggleDrag = function(event){
                $(event.target).toggleClass('dragging');
            };

            $scope.uiConfig = {
                calendar:{
                    editable: true,
                    droppable: true,
                    allDaySlot: false,
                    slotEventOverlap: false,
                    firstDay: 1,
                    titleFormat: {month:'MMM YYYY', week:'MMM YYYY', day:'D MMM YYYY'},
                    snapDuration: '00:15:00',
                    defaultView: sessionService.calendarView.view || ($scope.isBigScreen ? 'agendaWeek' : 'agendaDay'),
                    eventDurationEditable: false,
                    scrollTime:  "06:00:00",
                    defaultDate: sessionService.calendarView.start || null,
                    header:{
                        left: '',
                        center: 'prev title next',
                        right: 'month agendaWeek agendaDay today'
                    },
                    externalDragStart: function(){
                        $scope.$broadcast('hideDragServicePopover');
                    },
                    externalDragFail: function(){
                        if(showDragServicePopover()) $scope.$broadcast('showDragServicePopover');
                    },
                    drop: function(date, event) {
                        handleServiceDrop(date, $(this).data('service'));
                    },
                    // businessHours: {
                    //     // start: '00:00', // a start time (10am in this example)
                    //     // end: '24:00', // an end time (6pm in this example)

                    //     // Sunday = 0 Monday = 6
                    //     dow: [0, 2, 3, 4],
                    //     availableHours: {
                    //         0:{
                    //             start: '10:00', // a start time (10am in this example)
                    //             end: '11:00', // an end time (6pm in this example)
                    //         },
                    //         2: {
                    //             start: '10:00', // a start time (10am in this example)
                    //             end: '18:00', // an end time (6pm in this example)
                    //         }
                    //     }
                    // },
                    events: function(start, end, timezone, renderEvents){
                        if(!showOnboarding()){
                            var getSessionsParams = {
                                startDate: start.format('YYYY-MM-DD'),
                                endDate: end.format('YYYY-MM-DD'),
                                locationId: sessionService.calendarView.locationId,
                                coachId: sessionService.calendarView.coachId,
                                section: 'Sessions'
                            };
                            startCalendarLoading();
                            coachSeekAPIService.get(getSessionsParams)
                                .$promise.then(function(sessionObject){
                                    $scope.events = [];
                                    addSessionsWithinInterval(sessionObject.sessions);
                                    addCoursesWithinInterval(sessionObject.courses);
                                    renderEvents($scope.events);
                                    $scope.$broadcast('fetchSuccesful');
                                }, $scope.handleErrors).finally(function(){
                                    stopCalendarLoading();
                                });
                        }
                    },
                    eventRender: function(event, element, view) {
                        if(view.type !== 'month'){
                            $('<div></div>', {
                                class: 'fc-location',
                                text: event.session.location.name
                            }).appendTo(element.find('.fc-content'));
                        }
                        handleFullyBooked(event,element,view);
                    },
                    windowResize: function(view){
                        handleWindowResize(view.name);
                    },
                    eventDragStart: function(){
                        if($scope.shiftKeydown){
                            copyEventDrag = true;
                        } else {
                            copyEventDrag = false;
                        }
                    },
                    // handle event drag/drop within calendar
                    eventDrop: function( event, delta, revertDate){
                        if (copyEventDrag){
                            revertDate();
                            //remove id and save with new date
                            var newEvent = angular.copy(event);
                            if(newEvent.course){
                                //have to set $scope.currentEvent so sessionOrCourseModal can return id
                                $scope.currentEvent = newEvent;
                                sessionOrCourseModal($scope).then(function(id){
                                    startCalendarLoading();
                                    if(id === newEvent.course.id){
                                        startCalendarLoading();
                                        delete newEvent.session.id;
                                        delete newEvent.course.id;
                                        delete newEvent.session.booking.bookings;
                                        delete newEvent.course.booking.bookings;
                                        updateSessionTiming(newEvent.course, delta, revertDate, true);
                                    } else {
                                        delete newEvent.session.id;
                                        delete newEvent.session.booking.bookings;
                                        updateSessionTiming(newEvent.session, delta, revertDate, true);
                                    }
                                }, function(){
                                    revertDate();
                                });
                            } else {
                                delete newEvent.session.id;
                                delete newEvent.session.booking.bookings;
                                startCalendarLoading();
                                updateSessionTiming(newEvent.session, delta, revertDate, true);
                            }
                        } else  {
                            if(event.course){
                                //have to set $scope.currentEvent so sessionOrCourseModal can return id
                                $scope.currentEvent = event;
                                sessionOrCourseModal($scope).then(function(id){
                                    if(id === event.course.id){
                                        startCalendarLoading();
                                        updateSessionTiming(event.course, delta, revertDate, true);
                                    } else {
                                        updateSessionTiming(event.session, delta, revertDate, false);
                                    }
                                }, function(){
                                    revertDate();
                                });
                            } else {
                                updateSessionTiming(event.session, delta, revertDate, false);
                            }
                        }
                    },
                    eventClick: function(event, jsEvent, view) {
                        if(_.get(event, 'course.id') !== _.get($scope.currentEvent, 'course.id') || !_.has(event, 'course.id')) {
                            $scope.showModal = true;
                            $scope.$broadcast('triggerSliderSlide', 'attendance')
                            $scope.currentTab = 'attendance';
                        }
                        if($scope.isBigScreen || view.type == 'agendaDay'){
                            $scope.showModal = true;

                            if($currentEvent) $currentEvent.removeClass('current-event');
                            $currentEvent = $(jsEvent.currentTarget);
                            $currentEvent.addClass('current-event');
                        }

                        $scope.currentEvent = event;
                        currentEventService.event = $scope.currentEvent;
                        currentEventCopy = angular.copy(event);

                        if(event.course){
                            $scope.setCurrentCourseEvents();
                        } else {
                            delete $scope.currentCourseEvents;
                        }
                    },
                    viewRender: function(view){
                        _.assign(sessionService.calendarView, {
                            view: view.type,
                            start: view.intervalStart
                        });

                        $timeout(function(){
                            var heightToSet = $scope.isBigScreen ? ($('.calendar-container').height() - 10 ) : $(window).height();
                            uiCalendarConfig.calendars.sessionCalendar.fullCalendar('option', 'height', heightToSet);
                            handleWindowResize(view);
                        });
                    },
                    dayClick: function(date, jsEvent, ev, view) {
                        if(view.type === 'month'){
                            uiCalendarConfig.calendars.sessionCalendar.fullCalendar('changeView', 'agendaDay');
                            uiCalendarConfig.calendars.sessionCalendar.fullCalendar('gotoDate', date);
                        } else if (Modernizr.touchevents && ev.type !== "tap") {
                            handleServiceDrop(date, angular.copy(serviceDefaults));
                        }
                    }
                }
            };

            function updateSessionTiming(session, delta, revertDate, reloadRanges){
                var newDate = getNewDate(session.timing);
                newDate.add(delta);

                _.assign(session.timing, {
                    startDate: newDate.format('YYYY-MM-DD'),
                    startTime: newDate.format('HH:mm')
                });

                $activityIndicator.startAnimating();
                updateSession(session).then(function(session){
                    $scope.removeAlerts();
                    if(reloadRanges) uiCalendarConfig.calendars.sessionCalendar.fullCalendar('refetchEvents');
                }, function(error){
                    revertDate();
                    handleClashingError(error);
                }).finally(function(){
                    $activityIndicator.stopAnimating();
                });
            };

            var handleFullyBooked = function(event, element, view){
                var html,
                    studentCapacity = event.session.booking.studentCapacity;
                if(studentCapacity - _.size(event.session.booking.bookings) <= 0){
                    $scope.viewType = view.type;
                    if(studentCapacity === 1 && view.type !== 'month'){
                        //show private lesson customer name
                        var customer = event.session.booking.bookings[0].customer;
                        html = $compile("<calendar-private-session first-name='"+customer.firstName+"' last-name='"+customer.lastName+"'></calendar-private-session")($scope);
                    } else {
                        //show fully booked banner
                        html = $compile($templateCache.get('scheduling/partials/calendarFullyBooked.html'))($scope);
                    }

                    $('<div></div>', {
                        class: 'fc-fullybooked-' + view.type + ' ' + event.session.presentation.colour,
                        html: html
                    }).appendTo(element.find('.fc-content'));
                }
            };

            var handleWindowResize = function(viewName){
                var $sessionCalendar = uiCalendarConfig.calendars.sessionCalendar;
                if($scope.isBigScreen){
                    $sessionCalendar.find('.fc-agendaWeek-button').show();
                } else {
                    $sessionCalendar.find('.fc-agendaWeek-button').hide();
                    $scope.toggleOpen = false;
                    if(viewName === 'agendaWeek'){
                        $sessionCalendar.fullCalendar('changeView', 'agendaDay');
                    }
                }
                $sessionCalendar.fullCalendar('option', 'height', ($('.calendar-container').height() - 10));
            };

            var handleClashingError = function(error){
                var clashingMessage = error.data[0].data || error.data;
                clashingMessage = clashingMessage.substring(clashingMessage.indexOf(":") + 2, clashingMessage.indexOf(";"));

                $scope.addAlert({
                    type: 'danger',
                    message: 'scheduling:clashing-error',
                    clashingMessage: clashingMessage
                });
            };

            function handleServiceDrop(date, serviceData){
                $scope.showModal = true;
                $scope.$broadcast('triggerSliderSlide', 'general')
                $scope.currentTab = 'general';
                var session = buildSessionObject(date, serviceData);
                var repeatFrequency = serviceData.repetition.repeatFrequency;
                tempEventId = _.uniqueId('tempService_');

                _.times(serviceData.repetition.sessionCount, function(index){
                    var newEvent = buildCalendarEvent(moment(date).add(index, repeatFrequency), session);
                    $scope.events.push(newEvent);
                    uiCalendarConfig.calendars.sessionCalendar.fullCalendar('renderEvent', newEvent);
                    if(index === 0){
                        $scope.currentEvent = newEvent;
                        $scope.currentEvent.course = {pricing:newEvent.session.pricing};
                        if(showSessionModalPopover()) $scope.$broadcast('showSessionModalPopover', 500);
                    }
                });
            };

            var addCoursesWithinInterval = function(courses){
                _.forEach(courses, function(course){
                    addSessionsWithinInterval(course.sessions, course);
                });
            };

            var addSessionsWithinInterval = function(sessions, course){
                _.forEach(sessions, function(session){
                    var newDate = getNewDate(session.timing);
                    $scope.events.push(buildCalendarEvent(newDate, session, course));
                });
            };

            var buildCalendarEvent = function(date, session, course){
                var dateClone = date.clone();
                var duration = session.timing.duration;
                // set default display length to never be less than 30
                duration =  duration < 30 ? 30 : duration;

                return {
                    _id: tempEventId || _.uniqueId('session_'),
                    tempEventId: tempEventId,
                    title: session.service.name,
                    start: moment(dateClone),
                    end: moment(dateClone.clone().add(duration, 'minutes')),
                    _start: moment(dateClone),
                    _end: moment(dateClone.clone().add(duration, 'minutes')),
                    allDay: false,
                    className: session.presentation.colour,
                    session: session,
                    course: course
                };
            };

            var buildSessionObject = function(date, serviceData){
                return {
                    service: serviceData,
                    location: {
                        id: $scope.calendarView.locationId
                    },
                    coach: {
                        id: $scope.calendarView.coachId
                    },
                    timing: {
                        startDate: date.format('YYYY-MM-DD'),
                        startTime: date.format('HH:mm'),
                        duration: serviceData.timing.duration
                    },
                    booking: {
                        isOnlineBookable: _.get(serviceData, 'booking.isOnlineBookable', true),
                        studentCapacity: _.get(serviceData, 'booking.studentCapacity', 1),
                        bookings: []
                    },
                    pricing: serviceData.pricing,
                    presentation: serviceData.presentation,
                    repetition: serviceData.repetition
                };
            };

            $scope.filterSessions = function(){
                $scope.removeAlerts();
                uiCalendarConfig.calendars.sessionCalendar.fullCalendar('refetchEvents');
                // SET BIZ HOURS
                // uiCalendarConfig.calendars.sessionCalendar.fullCalendar({businessHours: {}});
                // uiCalendarConfig.calendars.sessionCalendar.fullCalendar('render');
            };

            // var buildAvailableHours = function(coachAvailibility){}

            // HELPER FUNCTIONS
            $scope.minutesToStr = function(duration){
                return Math.floor(duration / 60) + ":" + duration % 60;
            };

            $scope.getCurrentCoach = function(){
                if($scope.coachList){
                    return _.result(_.find($scope.coachList, {id: $scope.calendarView.coachId}), 'name');
                }
            };

            $scope.cancelModalEdit = function(){
                if(currentEventCopy){
                    // must keep autosaved edits even if canceled
                    currentEventCopy.session.booking = $scope.currentEvent.session.booking
                    if(currentEventCopy.course){
                        currentEventCopy.course.booking = $scope.currentEvent.course.booking
                        currentEventCopy.course.sessions = $scope.currentEvent.course.sessions
                    }
                    _.assign($scope.currentEvent, currentEventCopy);
                    uiCalendarConfig.calendars.sessionCalendar.fullCalendar('updateEvent', $scope.currentEvent);
                    currentEventCopy = null;
                }
                closeModal(true);
            };

            $scope.saveModalEdit = function(){
                var course = $scope.currentEvent.course;
                if($scope.currentEvent.tempEventId && course){
                    var session = $scope.currentEvent.session;
                    _.set(session, 'pricing.coursePrice', _.get($scope.currentEvent, 'course.pricing.coursePrice'));
                     saveSession(session);
                } else if(course){
                    sessionOrCourseModal($scope).then(function(id){
                        if(id === course.id){
                            saveSession(assignCourseAttributes(course));
                        } else {
                            saveSession($scope.currentEvent.session);
                        }
                    });
                } else {
                    saveSession($scope.currentEvent.session);
                }
            };

            var assignCourseAttributes = function(course){
                return _.assign($scope.currentEvent.session, {
                    id: course.id,
                    repetition: course.repetition,
                    timing: {
                        duration: $scope.currentEvent.session.timing.duration,
                        startDate: course.timing.startDate,
                        startTime: $scope.currentEvent.session.timing.startTime
                    },
                    pricing: {
                        sessionPrice: $scope.currentEvent.session.pricing.sessionPrice,
                        coursePrice: course.pricing.coursePrice
                    }
                });
            };

            var saveSession = function(session){
                startCalendarLoading();
                updateSession(session).then(function(session){
                    if($scope.currentEvent.tempEventId){
                        removeTempEvents();
                        totalNumSessions = null;
                        delete $scope.currentEvent.tempEventId;
                        if(session.sessions){
                            $scope.currentEvent.session = session.sessions[0];
                            $scope.currentEvent.course = session;
                        } else {
                            $scope.currentEvent.session = session;
                        }
                        // Add drag and session modal onboarding here
                        $scope.$broadcast('hideSessionModalPopover');
                        sessionService.onboarding.stepsCompleted.push('dragService', 'sessionModal');
                        if(sessionService.onboarding.showOnboarding) {
                            onboardingModal.open('onboardingReviewModal')
                                .then().finally(function(){
                                    sessionService.onboarding.showOnboarding = false;
                                });
                        }
                    }

                    closeModal();
                    $scope.removeAlerts();
                    uiCalendarConfig.calendars.sessionCalendar.fullCalendar('refetchEvents');
                }, handleCalendarErrors);
            };

            $scope.$on('fetchSuccesful', function(){
                if($scope.currentEvent) {
                    $scope.currentEvent = _.find($scope.events, function(event){
                        return event.session.id === $scope.currentEvent.session.id;
                    });
                    if($scope.currentEvent) $scope.setCurrentCourseEvents();
                }
            });

            $scope.setCurrentCourseEvents = function(){
                $scope.currentCourseEvents = currentEventService.currentCourseEvents = _.filter(uiCalendarConfig.calendars.sessionCalendar.fullCalendar('clientEvents'), function(event){
                    return _.get(event, 'course.id', 1) === _.get($scope, 'currentEvent.course.id', 1);
                });
            };

            $scope.deleteSession = function(){
                if($scope.currentEvent.course){
                    sessionOrCourseModal($scope).then(deleteSessions);
                } else {
                    deleteSessions($scope.currentEvent.session.id);
                }
            };

            $scope.toggleServiceDrawer = function(){
                $scope.calendarView.serviceDrawerOpen = !$scope.calendarView.serviceDrawerOpen
                if($scope.calendarView.serviceDrawerOpen && showDragServicePopover()){
                    $scope.$broadcast('showDragServicePopover');
                } else {
                    $scope.$broadcast('hideDragServicePopover');
                }
            };

            $scope.closePopover = function(hidePopoverTrigger){
                $scope.$broadcast(hidePopoverTrigger, 0, false);
            };

            var deleteSessions = function(id){
                startCalendarLoading();
                coachSeekAPIService.delete({section: 'Sessions', id: id})
                    .$promise.then(function(){

                        $scope.addAlert({
                            type: 'success',
                            message: id === $scope.currentEvent.session.parentId ? "scheduling:delete-course-success" : "scheduling:delete-session-success",
                            name: $scope.currentEvent.session.service.name,
                            startDate: $scope.currentEvent.start.format("MMMM Do YYYY, h:mm a")
                        });
                        closeModal();
                        uiCalendarConfig.calendars.sessionCalendar.fullCalendar('refetchEvents');
                    },  function(error){
                        $scope.handleErrors(error);
                        stopCalendarLoading();
                    });
            };

            var handleCalendarErrors = function(errors){
                _.forEach(errors.data, function(error){
                    if(error.code === "clashing-session"){
                        handleClashingError(error);
                    } else {
                        $scope.addAlert({
                            type: 'danger',
                            code: error.code,
                            message: error.message ? error.message: error
                        });
                    }
                });
                stopCalendarLoading();
            };

            var closeModal = function(resetTimePicker){
                removeTempEvents();
                $scope.$broadcast('closeTimePicker', resetTimePicker);
                $scope.$broadcast('resetSessionForm', resetTimePicker);
                $scope.$broadcast('hideSessionModalPopover');
                if(showDragServicePopover()) $scope.$broadcast('showDragServicePopover');
                $scope.showModal = false;
            };

            var removeTempEvents = function(){
                if(tempEventId){
                    uiCalendarConfig.calendars.sessionCalendar.fullCalendar('removeEvents', tempEventId);
                    tempEventId = null;
                    delete $scope.currentEvent.tempEventId;
                }
            };

            var getNewDate = function(timing){
                return moment(timing.startDate + " " + timing.startTime, "YYYY-MM-DD HH:mm");
            };

            var updateSession = function(sessionObject){
                return coachSeekAPIService.save({section: 'Sessions'}, sessionObject).$promise;
            };

            var startCalendarLoading = function(){
                if(!$scope.calendarLoading){
                    $scope.calendarLoading = true;
                }
            };

            var stopCalendarLoading = function(){
                $scope.calendarLoading = false;
            };

            function showOnboarding(){
                return sessionService.onboarding.showOnboarding && !_.includes(sessionService.onboarding.stepsCompleted, 'createDefaults');
            };

            function showDragServicePopover(){
                return sessionService.onboarding.showOnboarding && !_.includes(sessionService.onboarding.stepsCompleted, 'dragService');
            };

            function showSessionModalPopover(){
                return sessionService.onboarding.showOnboarding && !_.includes(sessionService.onboarding.stepsCompleted, 'sessionModal');
            };

            // TODO - do this in repeat selector
            $scope.$watch('currentEvent.session.repetition.sessionCount', function(newVal){
                if(_.get($scope, 'currentEvent.tempEventId') && newVal < 2){
                    if(_.get($scope, 'currentEvent.course.pricing.coursePrice')){
                        delete $scope.currentEvent.course.pricing.coursePrice;
                    }
                    if(_.get($scope, 'currentEvent.session.pricing.coursePrice')){
                        delete $scope.currentEvent.session.pricing.coursePrice;
                    }
                }
            });

            function initFetch(){
                // INITIAL LOAD
                startCalendarLoading();
                $q.all({
                        coaches: coachSeekAPIService.query({section: 'Coaches'}).$promise,
                        locations: coachSeekAPIService.query({section: 'Locations'}).$promise,
                        services: coachSeekAPIService.query({section: 'Services'}).$promise
                    })
                    .then(function(response) {
                        $scope.coachList    = response.coaches;
                        $scope.locationList = response.locations;
                        $scope.serviceList  = response.services;
                        if(showDragServicePopover()){
                            $timeout(function(){
                                stopCalendarLoading();
                                $scope.$broadcast('showDragServicePopover', 1000)
                            });
                        }
                    },function(error){
                        $scope.handleErrors(error);
                        stopCalendarLoading();
                    });
            }

            if(showOnboarding()){
                onboardingModal.open('onboardingDefaultsModal', 'onboardingDefaultsModalCtrl').then(function(response){
                    sessionService.onboarding.stepsCompleted.push('createDefaults');
                    initFetch();
                }, function(){
                    onboardingModal.open('exitOnboardingModal')
                        .then(function(){
                            $state.reload();
                        }, function(){
                            sessionService.onboarding.showOnboarding = false;
                        });
                });
            } else {
                initFetch();
            }
    }]);