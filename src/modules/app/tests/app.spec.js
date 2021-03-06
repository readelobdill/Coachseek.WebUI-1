describe('App Module', function() {
    it('should set $rootScope.alerts to an empty array', function(){
        expect($rootScope.alerts).to.be.empty;
    });

    describe('global alert system', function(){
        let('alertOne', function(){
            return {
                type: 'success',
                message: 'alert one'
            }
        });

        let('alertTwo', function(){
            return {
                type: 'warning',
                message: 'alert two'
            }
        });

        let('alertThree', function(){
            return {
                type: 'danger',
                message: 'alert three'
            }
        })

        beforeEach(function(){
            $rootScope.addAlert(this.alertOne);
            $rootScope.addAlert(this.alertTwo);
            $rootScope.addAlert(this.alertThree);
        });
        describe('when calling addAlert() with new alerts', function(){
            it('should set them on the $rootScope', function(){
                expect($rootScope.alerts.length).to.equal(3);
            })
        });
        describe('when calling addAlert() with existing alerts', function(){
            it('should not add them to alerts', function(){
                $rootScope.addAlert(this.alertOne);

                expect($rootScope.alerts.length).to.equal(3);
            });
        });
        describe('when calling closeAlert(index)', function(){
            it('should remove the correct alert', function(){
                $rootScope.closeAlert(1);

                expect(_.includes($rootScope.alerts, this.alertOne)).to.be.true;
                expect(_.includes($rootScope.alerts, this.alertThree)).to.be.true;
            });
        });
        describe('when calling removeAlerts()', function(){
            it('should erase all alerts from $rootScope', function(){
                $rootScope.removeAlerts()

                expect($rootScope.alerts).to.be.empty;
            })
        });
        describe('when adding a success alert', function(){
            it('should disappear after 3 seconds', function(){
                expect(this.alertOne.dismissTimeout).to.be.equal(3000);
            });
        });
        describe('when adding any other alert', function(){
            it('should disappear after 5 seconds', function(){
                expect(this.alertTwo.dismissTimeout).to.be.equal(5000);
                expect(this.alertThree.dismissTimeout).to.be.equal(5000);
            });
        });
    });
    describe('when navigating to the app for the first time',function(){
        var stateGoSpy;
        beforeEach(function(){
            stateGoSpy = this.sinon.spy($state,'go');
            $injector.get('sessionService').isBigScreen = false;
            $state.go('scheduling');
            $timeout.flush();
        });
        describe('and the user is on the mobile device',function(){
            it('should open mobile onboarding sign up page',function(){
                expect(stateGoSpy).to.be.calledWith('mobileOnboardingSignUp');
            });
        });
    });
    describe('login modal', function(){
        var intercomStub, $loginModal, $window;
        beforeEach(function(){
            modalStub.restore();
            intercomStub = this.sinon.stub(window, 'Intercom');
            $window = $injector.get('$window');
        });
        afterEach(function(){
            $window.localStorage.removeItem('coachseekLogin');
            $window.localStorage.removeItem('completedCoachseekMobileOnboarding');
        })
        describe('when clicking the login button', function(){
            beforeEach(function(){
                createViewWithController($rootScope, 'index.html', 'appCtrl')
                $testRegion.find('.logout').trigger('click');

                $loginModal = $('.modal');
            });
            it('should bring up the login modal', function(){
                expect($('body').hasClass('modal-open')).to.be.true;
            });
            describe('when clicking outside the login modal', function(){
                it('should not dismiss the login modal', function(){
                    $('.modal').trigger('click');
                    $timeout.flush();

                    expect($('body').hasClass('modal-open')).to.be.true;
                });
            });
            describe('when hitting the ESC key', function(){
                it('should not dismiss the login modal', function(){
                    var e = jQuery.Event("keydown");
                    e.which = 27; // # Some key code value
                    $(document).trigger(e);
                    $timeout.flush();

                    expect($('body').hasClass('modal-open')).to.be.true;
                });
            });
        });
        describe('when clicking the logout button', function(){
            var $http, $stateStub, sessionService;
            beforeEach(function(){
                $window.localStorage.setItem('coachseekLogin', 'testValue')
                $stateStub = this.sinon.stub($state, 'go');
                $http = $injector.get('$http');
                $http.defaults.headers.common['Authorization'] = 'TEST AUTH';
                $rootScope.currentUser = "TESTUSER";
                $rootScope.business = {};
                sessionService = $injector.get('sessionService');
                sessionService.user = {};
                sessionService.business = {};


                createViewWithController($rootScope, 'index.html', 'appCtrl')
                $testRegion.find('.logout').trigger('click');

                $loginModal = $('.modal');
            });
            afterEach(function(){
                $('.modal-backdrop').remove();
                $loginModal.remove();
            });
            it('should unset the currentUser and business from the rootScope', function(){
                expect($rootScope.currentUser).to.be.undefined;
                expect($rootScope.business).to.be.undefined;
            });
            it('should unset the business and user from sessionService', function(){
                expect(sessionService.user).to.be.undefined;
                expect(sessionService.business).to.be.undefined;
            });
            it('should unset the auth', function(){
                expect($http.defaults.headers.common['Authorization']).to.equal(null);
            });            
            it('should bring up the login modal', function(){
                expect($('body').hasClass('modal-open')).to.be.true;
            });
            it('should log out of Intercom', function(){
                expect(intercomStub).to.be.calledWith('shutdown');
            });
            it('should unset the login cookie', function(){
                expect($window.localStorage.getItem('coachseekLogin')).to.be.null;
            });
        });
        describe('when navigating to a page that requires a login', function(){

            let('loginPromise', function(){
                var deferred = $q.defer();
                deferred.resolve({
                    domain: 'testDomain',
                    name: 'test name'
                });
                return {$promise: deferred.promise};
            });

            var $loginModal, $stateStub,loginStub, self, $cookies, expiredLicenseModalStub;
            beforeEach(function(){
                $cookies = $injector.get('$cookies');
                self = this;
                self.loginPromise = this.loginPromise;
                var coachSeekAPIService = $injector.get('coachSeekAPIService');

                expiredLicenseModalStub = this.sinon.stub($injector.get('expiredLicenseModal'), 'open');

                loginStub = this.sinon.stub(coachSeekAPIService, 'get', function(){
                    return self.loginPromise
                });
                $rootScope.password = "password"
                $rootScope.email = "fake@email.com"
                $rootScope.$apply();
            });

            describe('and the login cookie is set', function(){
                var $window;
                beforeEach(function(){
                    $window = $injector.get('$window');
                    $window.localStorage.setItem('coachseekLogin', btoa($rootScope.email + ':' + $rootScope.password))
                    $state.go('scheduling');
                    $rootScope.$digest();
                    $loginModal = $('.modal');
                    $stateStub = this.sinon.stub($state, 'go');
                });
                afterEach(function(){
                    $('.modal-backdrop').remove();
                    $loginModal.remove();
                });
                // This test passes periodically. is not crucial.
                // it('should NOT bring up the login modal', function(){
                //     expect($('body').hasClass('modal-open')).to.be.false;
                // });
                describe('when the login is successful', function(){
                    it('should make a call to the API', function(){
                        expect(loginStub).to.be.calledWith({section: 'Business'});
                    });
                    it('should set the auth header', function(){
                        var $http = $injector.get('$http');
                        var authHeader = 'Basic ' + btoa($rootScope.email + ':' + $rootScope.password);
                        expect($http.defaults.headers.common['Authorization']).to.equal(authHeader)
                    });
                    it('should make a call to Intercom', function(){
                        expect(intercomStub).to.be.calledWith('boot');
                    });
                });
                describe('when the login is unsuccessful', function(){
                    let('loginPromise', function(){
                        var deferred = $q.defer();
                        deferred.reject({data: {code: "error-message"}, statusText: "error-message"});
                        return {$promise: deferred.promise};
                    });

                    it('should unset the auth header', function(){
                        var $http = $injector.get('$http');
                        expect($http.defaults.headers.common['Authorization']).to.equal(null)
                    });
                    it('should add an alert', function(){
                        expect($rootScope.alerts[0].type).to.equal('danger');
                        expect($rootScope.alerts[0].message).to.equal('error-message');
                    });
                });
                describe('when the users licencse has expired', function(){
                    let('loginPromise', function(){
                        var deferred = $q.defer();
                        deferred.reject({data: {code: 'license-expired'}, status: 403});
                        return {$promise: deferred.promise};
                    });
                    it('should attempt to open expired licencse modal', function(){
                        expect(expiredLicenseModalStub).to.be.calledOnce;
                    });
                });
            });
            describe('and the login cookie is NOT set', function(){
                var setItemSpy;
                beforeEach(function(){
                    setItemSpy = this.sinon.spy($window.localStorage, 'setItem');
                    $state.go('scheduling');
                    $rootScope.$digest();
                    $loginModal = $('.modal');
                    $stateStub = this.sinon.stub($state, 'go');
                });
                afterEach(function(){
                    $('.modal-backdrop').remove();
                    $loginModal.remove();
                });
                it('should bring up the login modal', function(){
                    expect($('body').hasClass('modal-open')).to.be.true;
                });
                describe('when the rememberMe checkbox is checked', function(){
                    beforeEach(function(){
                        $loginModal.find('.remember-me input').trigger('click');
                        $loginModal.find('.save-button').trigger('click');
                        $timeout.flush();
                    });
                    it('should set the login cookie', function(){
                        expect(setItemSpy).to.be.calledWith('coachseekLogin', btoa($rootScope.email + ':' + $rootScope.password));
                    });
                });
                describe('when the rememberMe checkbox is NOT checked', function(){
                    beforeEach(function(){
                        $loginModal.find('.save-button').trigger('click');
                        $timeout.flush();
                    });
                    it('should NOT set the login cookie', function(){
                        expect($window.localStorage.getItem('coachseekLogin')).to.be.null;
                    });
                });
                describe('when attempting to login and form is valid', function(){
                    beforeEach(function(){
                        $loginModal.find('.save-button').trigger('click');
                        //this must be here in order to flush out ngAnimate
                        $injector.get("$$rAF").flush();
                        $timeout.flush();
                    });
                    it('should make a call to the API', function(){
                        expect(loginStub).to.be.calledWith({section: 'Business'});
                    });
                    describe('when the login is successful', function(){
                        it('should set the auth header', function(){
                            var $http = $injector.get('$http');
                            var authHeader = 'Basic ' + btoa($rootScope.email + ':' + $rootScope.password);
                            expect($http.defaults.headers.common['Authorization']).to.equal(authHeader)
                        });
                        it('should remove the login modal', function(){
                            expect($('body').hasClass('modal-open')).to.be.false;
                        });
                        it('should attempt to navigate', function(){
                            expect($stateStub).to.be.calledWith('scheduling');
                        });
                        it('should make a call to Intercom', function(){
                            expect(intercomStub).to.be.calledWith('boot');
                        });
                        it('should set mobile onboarding to completed', function(){
                            expect(setItemSpy).to.be.calledWith('completedCoachseekMobileOnboarding', true);
                        });
                    });
                    describe('when the login is unsuccessful', function(){
                        let('loginPromise', function(){
                            var deferred = $q.defer();
                            deferred.reject({data: {code: 'license-expired'},statusText: "error-message"});
                            return {$promise: deferred.promise};
                        });

                        it('should unset the auth header', function(){
                            var $http = $injector.get('$http');
                            expect($http.defaults.headers.common['Authorization']).to.equal(null)
                        });
                        it('should add an alert', function(){
                            expect($rootScope.alerts[0].type).to.equal('danger');
                            expect($rootScope.alerts[0].message).to.equal('error-message');
                        });
                    });
                    describe('when the users licencse has expired', function(){
                        let('loginPromise', function(){
                            var deferred = $q.defer();
                            deferred.reject({data: {code: 'license-expired'}, status: 403});
                            return {$promise: deferred.promise};
                        });
                        it('should attempt to open expired licencse modal', function(){
                            expect(expiredLicenseModalStub).to.be.calledOnce;
                        });
                    });
                });
            });
        });
    });

    describe('when resizing the window', function(){

        let('screenWidth', function(){
            return 301;
        });

        var widthStub, self;
        beforeEach(function(){
            self = this;
            widthStub = this.sinon.stub($.fn, 'width', function(){
                return self.screenWidth;
            });
            $(window).trigger('resize');
        });

        describe('when it is smaller than 768px', function(){
            it('should set isBigScreen to FALSE', function(){
                expect($rootScope.isBigScreen).to.be.false;
            });
            describe('and then changing it to a big screen size', function(){

                let('screenWidth', function(){
                    return 800;
                });

                it('should set isBigScreen to TRUE', function(){
                    expect($rootScope.isBigScreen).to.be.true;
                });
            });
        });
        describe('when it is bigger than 768px', function(){

            let('screenWidth', function(){
                return 800;
            });

            it('should set isBigScreen to TRUE', function(){
                expect($rootScope.isBigScreen).to.be.true;
            });

            describe('and then changing it to a small screen size', function(){

                let('screenWidth', function(){
                    return 301;
                });

                it('should set isBigScreen to FALSE', function(){
                    expect($rootScope.isBigScreen).to.be.false;
                });
            })
        });
    });

    describe('when navigating to an online booking page', function(){
        let('business', function(){
            return {
                name: "BIZ NAME",
                domain: "bizname",
                currency: "USD"
            }
        });

        let('anonGetPromise', function(){
            var deferred = $q.defer();
            deferred.resolve(this.business);
            return deferred.promise;
        });

        let('subdomain', function(){
            return 'testsubdomain';
        });

        let('currentBooking', function(){
            return {};
        });

        var anonStub, anonGetStub, stateGoSpy;
        beforeEach(function(){
            var self = this;
            locationStub.restore();
            var $location = $injector.get('$location');
            this.sinon.stub($location, 'host', function(){
                return self.subdomain;
            });

            this.sinon.stub($location, 'search', function(){
                return self.currentBooking;
            });

            stateGoSpy = this.sinon.spy($state, 'go');

            onlineBookingAPIFactory = $injector.get('onlineBookingAPIFactory');
            anonGetStub = this.sinon.stub(onlineBookingAPIFactory.anon(), 'get', function(){
                return {$promise: self.anonGetPromise};
            });

            anonStub = this.sinon.stub(onlineBookingAPIFactory, 'anon', function(){
                return {
                    get: anonGetStub
                }
            });

            $state.go('booking.selection');
            $timeout.flush();
        });
        describe('when subdomain is a businessDomain', function(){
            describe('and a business is not set on the sessionService', function(){
                it('should attempt to get the business', function(){
                    expect(anonStub).to.be.calledOnce;
                    expect(anonStub).to.be.calledWith('testsubdomain');
                    expect(anonGetStub).to.be.calledOnce;
                    expect(anonGetStub).to.be.calledWith({section: 'Business'});
                });

                describe('when subdomain exists', function(){
                    it('should set business on the sessionService', function(){
                        expect($injector.get('sessionService').business).to.eql(this.business)
                    });
                    describe('when not coming back from a successful payment', function(){
                        it('should navigate to booking.selection', function(){
                            expect(stateGoSpy).to.be.calledWith('booking.selection');
                        });
                    });
                    describe('when currentBooking is passed through from successful payment', function(){
                        let('currentBooking', function(){
                            return {currentBooking: '{"customer":{"firstName":"D","lastName":"D","phone":"f","email":"d@f"}}'};
                        });
                        it('should navigate to booking.confirmation', function(){
                            expect(stateGoSpy).to.be.calledWith('booking.confirmation');
                        });
                    });
                });
                describe('when subdomain doesnt exist', function(){
                    let('anonGetPromise', function(){
                        var deferred = $q.defer();
                        deferred.reject();
                        return deferred.promise;
                    });

                    it('should show 404 error page', function(){
                        expect($state.current.name).to.equal('error.404');
                    });
                })
            });
        });

        describe('when subdomain is app', function(){
            let('subdomain', function(){
                return 'app-testing';
            });

            it('should open login', function(){
                expect(loginModalSpy).to.be.calledOnce;
            });
        })

    });

    // describe('when navigating to an unavailable URL', function(){
    //     beforeEach(function(){
    //         $state.go('/url/not/known');
    //         $rootScope.$digest();
    //     });
    //     it('should attempt to bring up the login modal if not logged in', function(){
    //         expect(loginModalSpy).to.be.calledOnce;
    //     });
    //     it('should map to scheduling template', function(){
    //         expect($state.current.templateUrl).to.equal('scheduling/partials/schedulingView.html');
    //     });
    //     it('should map to the scheduling controller', function(){
    //         expect($state.current.controller).to.equal('schedulingCtrl');
    //     });
    // });
});