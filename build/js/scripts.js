angular.module("app.controllers",[]).controller("appCtrl",["$rootScope",function(a){a.addAlert=function(b){var c=!0;_.forEach(a.alerts,function(a){return a.message===b.message?c=!1:void 0}),c&&a.alerts.push(b)},a.closeAlert=function(b){a.alerts.splice(b,1)},a.removeAlerts=function(){a.alerts=[]}}]),angular.module("app.directives",[]).directive("activityIndicator",function(){return{replace:!0,templateUrl:"app/partials/activityIndicator.html"}}),angular.module("app",["ui.bootstrap","ngRoute","jm.i18next","app.controllers","app.services","app.directives","businessSetup","ngActivityIndicator"]).config(["$routeProvider",function(a){a.otherwise({redirectTo:"/"})}]).config(["$i18nextProvider",function(a){a.options={lng:"en",fallbackLng:"en",ns:{namespaces:["app","businessSetup"],defaultNs:"app"},resGetPath:"modules/__ns__/i18n/__lng__/__ns__.json",defaultLoadingValue:""}}]).run(["$rootScope",function(a){a.alerts=[]}]),angular.module("app.services",[]).factory("coachSeekAPIService",["$http","$q","$timeout",function(a,b,c){var d={};return d.getCoaches=function(){this.deferred=b.defer();var a=this;return c(function(){a.deferred.resolve({})},_.random(500,1500)),this.deferred.promise},d.saveCoach=function(){var a=b.defer();return a.resolve("DATA"),a.promise},d.createCoach=function(){var a=b.defer();return a.resolve({businessId:"8786bcd0-3b14-4f7b-92db-198527a5b949",id:null,firstName:"NEWEST",lastName:"USER",email:"aaron.smith@example.com",phone:"021 99 88 77",workingHours:{monday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},tuesday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},wednesday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},thursday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},friday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},saturday:{isAvailable:!1,startTime:"9:00",finishTime:"17:00"},sunday:{isAvailable:!1,startTime:"9:00",finishTime:"17:00"}}}),a.promise},d}]),describe("coachSeekAPIService",function(){}),describe("App Module",function(){it("should set $rootScope.alerts to an empty array",function(){expect($rootScope.alerts).to.be.empty}),describe("global alert system",function(){beforeEach(function(){this.let("alertOne",function(){return{type:"warning",message:"alert one"}}),this.let("alertTwo",function(){return{type:"warning",message:"alert two"}}),this.let("alertThree",function(){return{type:"error",message:"alert three"}}),$rootScope.addAlert(this.alertOne),$rootScope.addAlert(this.alertTwo),$rootScope.addAlert(this.alertThree)}),describe("when calling addAlert() with new alerts",function(){it("should set them on the $rootScope",function(){expect($rootScope.alerts.length).to.equal(3)})}),describe("when calling addAlert() with existing alerts",function(){it("should not add them to alerts",function(){$rootScope.addAlert(this.alertOne),expect($rootScope.alerts.length).to.equal(3)})}),describe("when calling closeAlert(index)",function(){it("should remove the correct alert",function(){$rootScope.closeAlert(1),expect(_.contains($rootScope.alerts,this.alertOne)).to.be["true"],expect(_.contains($rootScope.alerts,this.alertThree)).to.be["true"]})}),describe("when calling removeAlerts()",function(){it("should erase all alerts from $rootScope",function(){$rootScope.removeAlerts(),expect($rootScope.alerts).to.be.empty})})})}),angular.module("businessSetup.controllers",[]).controller("coachListCtrl",["$scope","coachSeekAPIService","$location","$activityIndicator",function(a,b,c,d){var e;a.editCoach=function(b){_.pull(a.coachList,b),e=angular.copy(b),a.coach=b,a.weekdays=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]},a.createCoach=function(){d.startAnimating(),b.createCoach().then(function(b){a.newCoach=!0,a.editCoach(b)},function(b){a.addAlert({type:"danger",message:"businessSetup:"+b.message+"-invalid"})})["finally"](function(){d.stopAnimating()})},a.cancelEdit=function(){a.newCoach||a.coachList.push(e),f()};var f=function(){a.coach=null,a.removeAlerts(),a.newCoach=null,e=null};a.saveCoach=function(c){var e=g();e&&(d.startAnimating(),b.saveCoach(c.coachId).then(function(){a.coachList.push(c),f()},function(b){a.addAlert({type:"danger",message:"businessSetup:"+b.message+"-invalid"})})["finally"](function(){d.stopAnimating()}))};var g=function(){var b=a.coachForm.$valid;if(b)b=h(b);else{var c=a.coachForm.$error;_.forEach(c,function(b,c){var d=b[0]&&b[0].$name?b[0].$name:c;a.addAlert({type:"warning",message:"businessSetup:"+d+"-invalid"})})}return b},h=function(b){return _.find(a.coachList,{firstName:a.coach.firstName,lastName:a.coach.lastName})&&(a.addAlert({type:"warning",message:"businessSetup:name-already-exists"}),b=!1),b};a.navigateToServices=function(){!a.coachList||a.coachList.length<=0?a.addAlert({type:"warning",message:"businessSetup:add-coach-warning"}):c.path("/business-setup/coach-services")},d.startAnimating(),b.getCoaches().then(function(b){b.length?a.coachList=b:(a.coachList=[],a.createCoach())},function(b){a.addAlert({type:"danger",message:"businessSetup:"+b.message+"-invalid"})})["finally"](function(){d.stopAnimating()})}]).controller("locationsCtrl",["$scope",function(){console.log("LOCATIONS CTRL")}]).controller("coachServicesCtrl",["$scope",function(){console.log("SERVICES CTRL")}]),angular.module("businessSetup.directives",[]).directive("timeSlot",function(){return{replace:!0,templateUrl:"businessSetup/partials/timeSlot.html"}}).directive("timePicker",function(){return{replace:!0,templateUrl:"businessSetup/partials/timePicker.html",scope:{time:"="},link:function(a){a.time=a.time?a.time:"0:00";var b=a.time.split(":");a.hours=parseFloat(b[0]),a.minutes=parseFloat(b[1]),a.increaseHours=function(){a.hours=a.hours<23?++a.hours:0,d()},a.decreaseHours=function(){a.hours=a.hours<=0?23:--a.hours,d()},a.increaseMinutes=function(){a.minutes>=45?(a.minutes=0,a.increaseHours()):a.minutes=a.minutes+15,d()},a.decreaseMinutes=function(){a.minutes<=0?(a.minutes=45,a.decreaseHours()):a.minutes=a.minutes-15,d()};var c=function(){return a.minutes<=9?"0"+a.minutes:a.minutes},d=function(){var b=c();a.time=a.hours+":"+b}}}}).directive("timeRangePicker",function(){return{replace:!1,scope:{start:"=",finish:"=",disabled:"=ngDisabled"},templateUrl:"businessSetup/partials/timeRangePicker.html",require:"ngModel",link:function(a,b,c,d){a.$watchGroup(["start","finish","disabled"],function(a){if(a[0]&&a[1]){var b=e(a[0]),c=e(a[1]);a[2]===!0||b.hours<c.hours?d.$setValidity("timeRange",!0):(b.hours===c.hours&&b.minutes>=c.minutes||b.hours>c.hours)&&d.$setValidity("timeRange",!1)}});var e=function(a){var b=a.split(":");return a={},a.hours=parseFloat(b[0]),a.minutes=parseFloat(b[1]),a}}}}),angular.module("businessSetup",["businessSetup.controllers","businessSetup.directives","toggle-switch"]).config(["$routeProvider",function(a){a.when("/business-setup/coach-list",{templateUrl:"businessSetup/partials/coachListView.html",controller:"coachListCtrl"}).when("/business-setup/coach-services",{templateUrl:"businessSetup/partials/coachServices.html",controller:"coachServicesCtrl"}).when("/business-setup/locations",{templateUrl:"businessSetup/partials/locations.html",controller:"locationsCtrl"})}]).constant("timepickerConfig",{hourStep:1,minuteStep:15,showMeridian:!1}),describe("BusinessSetup Module",function(){var a,b,c="businessSetup/partials/coachListView.html";beforeEach(function(){b=$injector.get("coachSeekAPIService"),a=$rootScope.$new()}),describe("businessSetup routes",function(){it("should map routes to controllers",function(){expect($route.routes["/business-setup/coach-list"].controller).to.equal("coachListCtrl"),expect($route.routes["/business-setup/coach-services"].controller).to.equal("coachServicesCtrl"),expect($route.routes["/business-setup/locations"].controller).to.equal("locationsCtrl")}),it("should map routes to templates",function(){expect($route.routes["/business-setup/coach-list"].templateUrl).to.equal("businessSetup/partials/coachListView.html"),expect($route.routes["/business-setup/coach-services"].templateUrl).to.equal("businessSetup/partials/coachServices.html"),expect($route.routes["/business-setup/locations"].templateUrl).to.equal("businessSetup/partials/locations.html")}),it("should default to root",function(){expect($route.routes[null].redirectTo).to.equal("/")})}),describe("when the page loads",function(){var d,e,f,g,h;beforeEach(function(){h=this,h.let("coaches",function(){return[]}),f=this.sinon.stub(b,"getCoaches",function(){var a=$q.defer();return a.resolve(h.coaches),a.promise}),g=this.sinon.stub(b,"createCoach",function(){var a=$q.defer();return a.resolve([{}]),a.promise})}),it("should attempt to call getCoaches",function(){createViewWithController(a,c,"coachListCtrl"),expect(f).to.be.calledOnce}),describe("when getCoaches throws an error",function(){var d="errorMessage";beforeEach(function(){f.restore(),f=this.sinon.stub(b,"getCoaches",function(){var a=$q.defer();return a.reject(new Error(d)),a.promise})}),it("should throw",function(){expect(createViewWithController(a,c,"coachListCtrl")).to["throw"]}),it("should display an error message",function(){createViewWithController(a,c,"coachListCtrl"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+d+"-invalid")})}),describe("and there are no coaches",function(){beforeEach(function(){createViewWithController(a,c,"coachListCtrl"),e=$testRegion.find(".coach-edit-view")}),it("should not show the coach list view",function(){expect($testRegion.find(".coach-list-view").hasClass("ng-hide")).to.be["true"]}),it("should show the coach edit view",function(){expect($testRegion.find(".coach-edit-view").hasClass("ng-hide")).to.be["false"]}),it("should attempt to create a coach",function(){expect(g).to.be.calledOnce}),it("should not show the cancel button",function(){expect(e.find(".cancel-button").hasClass("ng-hide")).to.be["true"]})}),describe("and there are one or more coaches",function(){beforeEach(function(){h.let("firstCoach",function(){return{firstName:"Test",lastName:"User",email:"test@example.com",phone:"9090909"}}),h.let("coaches",function(){return[h.firstCoach,{}]}),createViewWithController(a,c,"coachListCtrl"),d=$testRegion.find(".coach-list-view"),e=$testRegion.find(".coach-edit-view")}),it("should show the coach list view",function(){expect(d.hasClass("ng-hide")).to.be["false"]}),it("should have as many list entries as coaches",function(){expect(d.find(".coach-details").length).to.equal(h.coaches.length)}),it("should not show the coach edit view",function(){expect(e.hasClass("ng-hide")).to.be["true"]}),describe("when clicking the edit button",function(){beforeEach(function(){d.find(".edit-coach").first().trigger("click")}),it("should not show the coach list view",function(){expect(d.hasClass("ng-hide")).to.be["true"]}),it("should show the coach edit view",function(){expect(e.hasClass("ng-hide")).to.be["false"]}),it("should show the cancel button",function(){expect(e.find(".cancel-button").hasClass("ng-hide")).to.be["false"]}),describe("when clicking the save button",function(){var c;beforeEach(function(){c=this.sinon.stub(b,"saveCoach",function(){var a=$q.defer();return a.resolve([{}]),a.promise})}),describe("when saveCoach throws an error",function(){var a="errorMessage";beforeEach(function(){c.restore(),c=this.sinon.stub(b,"saveCoach",function(){var b=$q.defer();return b.reject(new Error(a)),b.promise})}),it("should throw",function(){expect(e.find(".save-coach").trigger("click")).to["throw"]}),it("should display an error message",function(){e.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+a+"-invalid")})}),describe("when the form is invalid",function(){describe("when the firstName is invalid",function(){it("should display an invalid input alert",function(){a.coach.firstName=null,a.$apply(),e.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:firstName-invalid")})}),describe("when the lastName is invalid",function(){it("should display an invalid input alert",function(){a.coach.lastName=null,a.$apply(),e.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:lastName-invalid")})}),describe("when the phone is invalid",function(){it("should display an invalid input alert",function(){a.coach.phone=null,a.$apply(),e.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:phone-invalid")})}),describe("when the email is invalid",function(){it("should display an invalid input alert",function(){a.coach.email="badEmail.com",a.$apply(),e.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:email-invalid")})}),describe("when a timeRange is invalid",function(){it("should display an invalid input alert",function(){a.coachForm.$setValidity("timeRange",!1),e.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:timeRange-invalid")})})}),describe("when the coach name already exists",function(){beforeEach(function(){a.coachList.push(angular.copy(h.firstCoach)),e.find(".save-coach").trigger("click")}),it("should display an alert",function(){expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:name-already-exists")})}),describe("when the coach name is new",function(){beforeEach(function(){e.find(".save-coach").trigger("click")}),it("should attempt to save coach",function(){expect(c).to.be.calledOnce}),it("should show the coach list view",function(){expect(d.hasClass("ng-hide")).to.be["false"]}),it("should not show the coach edit view",function(){expect(e.hasClass("ng-hide")).to.be["true"]})})}),describe("when clicking the cancel button",function(){beforeEach(function(){a.coach={firstName:"dumbnew",lastName:"userguy",email:"dude@dude.com",phone:"021 99 88 77"},a.$apply(),$rootScope.alerts.push({type:"warning",message:"test alert"}),e.find(".cancel-button").trigger("click")}),it("should reset all edits made",function(){var b=a.coachList.pop();expect(b.firstName).to.equal(h.firstCoach.firstName),expect(b.lastName).to.equal(h.firstCoach.lastName),expect(b.email).to.equal(h.firstCoach.email),expect(b.phone).to.equal(h.firstCoach.phone)}),it("should remove alert if present",function(){expect($rootScope.alerts.length).to.equal(0)})})}),describe("when creating a new coach",function(){var c;beforeEach(function(){c=a.coachList.length,d.find(".create-coach").trigger("click")}),it("should attempt to create a coach",function(){expect(g).to.be.calledOnce}),it("should not show the coach list view",function(){expect($testRegion.find(".coach-list-view").hasClass("ng-hide")).to.be["true"]}),it("should show the coach edit view",function(){expect($testRegion.find(".coach-edit-view").hasClass("ng-hide")).to.be["false"]}),it("should show the cancel button",function(){expect(e.find(".cancel-button").hasClass("ng-hide")).to.be["false"]}),it("should set the newCoach flag to true",function(){expect(a.newCoach).to.be["true"]}),describe("when createCoach throws an error",function(){var a="errorMessage";beforeEach(function(){g.restore(),g=this.sinon.stub(b,"createCoach",function(){var b=$q.defer();return b.reject(new Error(a)),b.promise})}),it("should throw",function(){expect(d.find(".create-coach").trigger("click")).to["throw"]}),it("should display an error message",function(){d.find(".create-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+a+"-invalid")})}),describe("when clicking the cancel button and coach is new",function(){beforeEach(function(){e.find(".cancel-button").trigger("click")}),it("should discard the new coach",function(){expect(a.coachList.length).to.equal(c)})})})}),describe("when navigating to services before adding a coach",function(){beforeEach(function(){createViewWithController(a,c,"coachListCtrl"),$location.path("/business-setup/coach-list"),$testRegion.find(".nav-to-services")[0].click()}),it("should not allow navigation",function(){expect($location.path()).to.equal("/business-setup/coach-list")}),it("should show a warning message",function(){expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:add-coach-warning")}),describe("after adding a coach",function(){beforeEach(function(){a.coachList=[{}],$testRegion.find(".nav-to-services")[0].click()}),it("should allow navigation",function(){expect($location.path()).to.equal("/business-setup/coach-services")})})})}),describe("timeSlot directive",function(){beforeEach(function(){a.weekdays=["monday","tuesday","wednesday"],a.coach={firstName:"NEWEST",lastName:"USER",email:"aaron.smith@example.com",phone:"021 99 88 77",workingHours:{monday:{isAvailable:!0,startTime:"11:00",finishTime:"11:00"},tuesday:{isAvailable:!1},wednesday:{isAvailable:!0}}},createDirective(a,"<div><time-slot></time-slot></div>")}),it("should have as many entries as days",function(){var b=$testRegion.find(".weekday");expect(b.length).to.equal(_.size(a.coach.workingHours))}),describe("when a day is available",function(){it("should enable the time spinner",function(){var a=$testRegion.find(".weekday").first();expect(a.find("time-range-picker").attr("disabled")).to.equal(void 0)})}),describe("when a day is unavailable",function(){it("should disable the time spinner",function(){var a=$testRegion.find(".weekday:nth-child(2)");expect(a.find("time-range-picker").attr("disabled")).to.equal("disabled")})}),describe("when clicking on the toggle available switch",function(){var b;beforeEach(function(){var a=$testRegion.find(".weekday").first();b=a.find(".toggle-switch"),b.trigger("click")}),it("should set isAvailable to false",function(){expect(a.coach.workingHours.monday.isAvailable).to.be["false"]}),it("the day should be valid",function(){var a=$testRegion.find("time-range-picker").first();expect(a.hasClass("ng-invalid")).to.be["false"]}),describe("when clicking on the toggle available switch again",function(){it("should set isAvailable to true",function(){b.trigger("click"),expect(a.coach.workingHours.monday.isAvailable).to.be["true"]}),it("the day should be invalid",function(){b.trigger("click");var a=$testRegion.find("time-range-picker").first();expect(a.hasClass("ng-invalid")).to.be["true"]})})}),describe("time validation",function(){describe("when times are the same",function(){it("the day should be invalid",function(){var a=$testRegion.find("time-range-picker").first();expect(a.hasClass("ng-invalid")).to.be["true"]})}),describe("when there is negative time between the times",function(){it("the day should be invalid",function(){a.coach.workingHours.monday.startTime="12:00",a.$apply();var b=$testRegion.find("time-range-picker").first();expect(b.hasClass("ng-invalid")).to.be["true"]})}),describe("when there is ample time between times",function(){it("the day should be vaild",function(){a.coach.workingHours.monday.startTime="9:00",a.$apply();var b=$testRegion.find("time-range-picker").first();expect(b.hasClass("ng-invalid")).to.be["false"]})})})}),describe("timePicker directive",function(){describe("when default time is not provided",function(){beforeEach(function(){a.testTime="",createDirective(a,'<div><time-picker time="testTime"></time-picker></div>')}),it("should set default time if time not provided",function(){expect(a.testTime).to.equal("0:00")})}),describe("when default time is provided",function(){beforeEach(function(){this.let("testTime",function(){return"22:00"}),a.testTime=this.testTime,createDirective(a,'<div><time-picker time="testTime"></time-picker></div>')}),it("should set time to time provided",function(){expect(a.testTime).to.equal(this.testTime)}),describe("when clicking the increase hour button",function(){var b;beforeEach(function(){b=$testRegion.find(".increase .hours"),b.trigger("click")}),it("should add an hour to the set time",function(){expect(a.testTime).to.equal("23:00")})}),describe("when clicking the decrease hour button",function(){var b;beforeEach(function(){b=$testRegion.find(".decrease .hours"),b.trigger("click")}),it("should add an hour to the set time",function(){expect(a.testTime).to.equal("21:00")})}),describe("when clicking the increase minute button",function(){var b;beforeEach(function(){b=$testRegion.find(".increase .minutes")}),it("should increase the time by 15 minutes",function(){b.trigger("click"),expect(a.testTime).to.equal("22:15")})}),describe("when clicking the decrease minute button",function(){var b;beforeEach(function(){b=$testRegion.find(".decrease .minutes")}),it("should reduce the time by 15 minutes",function(){b.trigger("click"),expect(a.testTime).to.equal("21:45")})})})})});