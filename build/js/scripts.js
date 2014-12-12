angular.module("app.controllers",[]).controller("appCtrl",["$rootScope",function(a){a.addAlert=function(b){var c=!0;_.forEach(a.alerts,function(a){return a.message===b.message?c=!1:void 0}),c&&a.alerts.push(b)},a.closeAlert=function(b){a.alerts.splice(b,1)},a.removeAlerts=function(){a.alerts=[]}}]),angular.module("app.directives",[]).directive("activityIndicator",function(){return{replace:!0,templateUrl:"app/partials/activityIndicator.html"}}),angular.module("app",["ui.bootstrap","ui.router","jm.i18next","app.controllers","app.services","app.directives","businessSetup","ngActivityIndicator"]).config(["$stateProvider",function(a){a.state("home",{url:"/"})}]).config(["$i18nextProvider",function(a){a.options={lng:"en",fallbackLng:"en",ns:{namespaces:["app","businessSetup"],defaultNs:"app"},resGetPath:"modules/__ns__/i18n/__lng__/__ns__.json",defaultLoadingValue:""}}]).run(["$rootScope","$state","$stateParams",function(a,b,c){a.$state=c,a.$stateParams=b,a.alerts=[]}]),angular.module("app.services",[]).factory("coachSeekAPIService",["$http","$q","$timeout",function(a,b,c){var d={};return d.getServices=function(){this.deferred=b.defer();var a=this;return c(function(){a.deferred.resolve([{businessId:"8786bcd0-3b14-4f7b-92db-198527a5b949",id:null,name:"Squash",description:"a pumpkin carving class",timing:{duration:"0:15"},booking:{studentCapacity:4},presentation:{color:"red"}},{businessId:"8786bcd0-3b14-4f7b-92db-198527a5b949",id:null,name:"Tiddlywinks",description:"I mean, c'mon. Its tiddlywinks",timing:{duration:"0:15"},booking:{studentCapacity:8},presentation:{color:"red"}}])},_.random(500,1500)),this.deferred.promise},d.createService=function(){this.deferred=b.defer();var a=this;return c(function(){a.deferred.resolve({businessId:"8786bcd0-3b14-4f7b-92db-198527a5b949",id:null,firstName:"NEWEST",name:"USER",description:"aaron.smith@example.com",timing:{duration:"0:15"},booking:{studentCapacity:8},presentation:{color:"blue"}})},_.random(500,800)),this.deferred.promise},d.saveService=function(){var a=b.defer();return a.resolve("DATA"),a.promise},d.getCoaches=function(){this.deferred=b.defer();var a=this;return c(function(){a.deferred.resolve({})},_.random(500,1500)),this.deferred.promise},d.saveCoach=function(){var a=b.defer();return a.resolve("DATA"),a.promise},d.createCoach=function(){var a=b.defer();return a.resolve({businessId:"8786bcd0-3b14-4f7b-92db-198527a5b949",id:null,firstName:"NEWEST",lastName:"USER",email:"aaron.smith@example.com",phone:"021 99 88 77",workingHours:{monday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},tuesday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},wednesday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},thursday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},friday:{isAvailable:!0,startTime:"9:00",finishTime:"17:00"},saturday:{isAvailable:!1,startTime:"9:00",finishTime:"17:00"},sunday:{isAvailable:!1,startTime:"9:00",finishTime:"17:00"}}}),a.promise},d}]),describe("coachSeekAPIService",function(){}),describe("App Module",function(){it("should set $rootScope.alerts to an empty array",function(){expect($rootScope.alerts).to.be.empty}),describe("global alert system",function(){beforeEach(function(){this.let("alertOne",function(){return{type:"warning",message:"alert one"}}),this.let("alertTwo",function(){return{type:"warning",message:"alert two"}}),this.let("alertThree",function(){return{type:"error",message:"alert three"}}),$rootScope.addAlert(this.alertOne),$rootScope.addAlert(this.alertTwo),$rootScope.addAlert(this.alertThree)}),describe("when calling addAlert() with new alerts",function(){it("should set them on the $rootScope",function(){expect($rootScope.alerts.length).to.equal(3)})}),describe("when calling addAlert() with existing alerts",function(){it("should not add them to alerts",function(){$rootScope.addAlert(this.alertOne),expect($rootScope.alerts.length).to.equal(3)})}),describe("when calling closeAlert(index)",function(){it("should remove the correct alert",function(){$rootScope.closeAlert(1),expect(_.contains($rootScope.alerts,this.alertOne)).to.be["true"],expect(_.contains($rootScope.alerts,this.alertThree)).to.be["true"]})}),describe("when calling removeAlerts()",function(){it("should erase all alerts from $rootScope",function(){$rootScope.removeAlerts(),expect($rootScope.alerts).to.be.empty})})})}),angular.module("businessSetup.controllers",[]).controller("servicesCtrl",["$scope","CRUDFactoryService",function(a,b){a.createItem=function(){b.create("createService",a)},a.editItem=function(b){_.pull(a.itemList,b),a.itemCopy=angular.copy(b),a.item=b},a.saveItem=function(c){var d=b.validateForm(a);d&&b.update("saveService",a,c)},a.cancelEdit=function(){b.cancelEdit(a)},a.checkDuplicateNames=function(b){var c=a.item.name;return _.find(a.itemList,{name:c})&&(a.addAlert({type:"warning",message:"businessSetup:name-already-exists"}),b=!1),b},a.$on("$stateChangeStart",function(b,c){"businessSetup.scheduling"===c.name&&(!a.itemList||a.itemList.length<=0)&&(b.preventDefault(),a.addAlert({type:"warning",message:"businessSetup:add-services-warning"}))}),b.get("getServices",a)}]).controller("locationsCtrl",["$scope",function(){console.log("LOCATIONS CTRL")}]).controller("schedulingCtrl",["$scope",function(){console.log("LOCATIONS CTRL")}]).controller("coachesCtrl",["$scope","CRUDFactoryService","$state",function(a,b){a.editItem=function(b){_.pull(a.itemList,b),a.itemCopy=angular.copy(b),a.item=b,a.weekdays=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]},a.createItem=function(){b.create("createCoach",a)},a.cancelEdit=function(){b.cancelEdit(a)},a.saveItem=function(c){var d=b.validateForm(a);d&&b.update("saveCoach",a,c)},a.checkDuplicateNames=function(b){var c=a.item.firstName,d=a.item.lastName;return _.find(a.itemList,{firstName:c,lastName:d})&&(a.addAlert({type:"warning",message:"businessSetup:name-already-exists"}),b=!1),b},a.$on("$stateChangeStart",function(b,c){"businessSetup.services"===c.name&&(!a.itemList||a.itemList.length<=0)&&(b.preventDefault(),a.addAlert({type:"warning",message:"businessSetup:add-coach-warning"}))}),b.get("getCoaches",a)}]),angular.module("businessSetup.directives",[]).directive("colorPicker",function(){var a=["red","green","blue","orange","yellow"];return{scope:{currentColor:"="},templateUrl:"businessSetup/partials/colorPicker.html",link:function(b){b.colors=a,b.$watch("savedhex",function(a){b.currentColor=a})}}}).directive("timeSlot",function(){return{replace:!0,templateUrl:"businessSetup/partials/timeSlot.html"}}).directive("timePicker",function(){return{replace:!0,templateUrl:"businessSetup/partials/timePicker.html",scope:{time:"="},link:function(a){a.$watch("time",function(b){if(a.time=b,a.time){var c=a.time.split(":");a.hours=parseFloat(c[0]),a.minutes=parseFloat(c[1])}}),a.increaseHours=function(){a.hours=a.hours<23?++a.hours:0,c()},a.decreaseHours=function(){a.hours=a.hours<=0?23:--a.hours,c()},a.increaseMinutes=function(){a.minutes>=45?(a.minutes=0,a.increaseHours()):a.minutes=a.minutes+15,c()},a.decreaseMinutes=function(){a.minutes<=0?(a.minutes=45,a.decreaseHours()):a.minutes=a.minutes-15,c()};var b=function(){return a.minutes<=9?"0"+a.minutes:a.minutes},c=function(){var c=b();a.time=a.hours+":"+c}}}}).directive("timeRangePicker",function(){return{replace:!1,scope:{start:"=",finish:"=",disabled:"=ngDisabled"},templateUrl:"businessSetup/partials/timeRangePicker.html",require:"ngModel",link:function(a,b,c,d){a.$watchGroup(["start","finish","disabled"],function(a){if(a[0]&&a[1]){var b=e(a[0]),c=e(a[1]);a[2]===!0||b.hours<c.hours?d.$setValidity("timeRange",!0):(b.hours===c.hours&&b.minutes>=c.minutes||b.hours>c.hours)&&d.$setValidity("timeRange",!1)}});var e=function(a){var b=a.split(":");return a={},a.hours=parseFloat(b[0]),a.minutes=parseFloat(b[1]),a}}}}),angular.module("businessSetup",["businessSetup.controllers","businessSetup.directives","businessSetup.services","toggle-switch"]).config(["$stateProvider",function(a){a.state("businessSetup",{"abstract":!0,url:"/business-setup",templateUrl:"businessSetup/partials/businessSetup.html"}).state("businessSetup.locations",{url:"/locations",views:{"list-item-view":{templateUrl:"businessSetup/partials/locationsView.html",controller:"locationsCtrl"}}}).state("businessSetup.coachList",{url:"/coach-list",views:{"list-item-view":{templateUrl:"businessSetup/partials/coachesView.html",controller:"coachesCtrl"}}}).state("businessSetup.services",{url:"/services",views:{"list-item-view":{templateUrl:"businessSetup/partials/servicesView.html",controller:"servicesCtrl"}}}).state("businessSetup.scheduling",{url:"/scheduling",views:{"list-item-view":{templateUrl:"businessSetup/partials/schedulingView.html",controller:"schedulingCtrl"}}})}]).constant("timepickerConfig",{hourStep:1,minuteStep:15,showMeridian:!1}),angular.module("businessSetup.services",[]).factory("CRUDFactoryService",["coachSeekAPIService","$activityIndicator",function(a,b){var c={};c.get=function(c,d){b.startAnimating(),a[c]().then(function(a){a.length?d.itemList=a:(d.itemList=[],d.createItem())},function(a){d.addAlert({type:"danger",message:"businessSetup:"+a.message+"-invalid"})})["finally"](function(){b.stopAnimating()})},c.create=function(c,d){b.startAnimating(),a[c]().then(function(a){d.newItem=!0,d.editItem(a)},function(a){d.addAlert({type:"danger",message:"businessSetup:"+a.message+"-invalid"})})["finally"](function(){b.stopAnimating()})},c.update=function(c,e,f){b.startAnimating(),a[c]().then(function(){e.itemList.push(f),d(e)},function(a){e.addAlert({type:"danger",message:"businessSetup:"+a.message+"-invalid"})})["finally"](function(){b.stopAnimating()})},c.cancelEdit=function(a){a.newItem||a.itemList.push(a.itemCopy),d(a)},c.validateForm=function(a){var b=a.itemForm.$valid;if(b)b=a.checkDuplicateNames(b);else{var c=a.itemForm.$error;_.forEach(c,function(b,c){var d=b[0]&&b[0].$name?b[0].$name:c;a.addAlert({type:"warning",message:"businessSetup:"+d+"-invalid"})})}return b};var d=function(a){a.item=null,a.removeAlerts(),a.newItem=null,a.itemCopy=null};return c}]),describe("BusinessSetup Module",function(){var a,b;beforeEach(function(){b=$injector.get("coachSeekAPIService"),a=$rootScope.$new()}),describe("businessSetup states",function(){describe("when navigating to businessSetup.services",function(){var a;beforeEach(function(){$state.go("businessSetup.services"),$rootScope.$digest(),a=$state.current.views["list-item-view"]}),it("should map to correct template",function(){expect(a.templateUrl).to.equal("businessSetup/partials/servicesView.html")}),it("should map to the correct controller",function(){expect(a.controller).to.equal("servicesCtrl")})}),describe("when navigating to businessSetup.coachList",function(){var a;beforeEach(function(){$state.go("businessSetup.coachList"),$rootScope.$digest(),a=$state.current.views["list-item-view"]}),it("should map to correct template",function(){expect(a.templateUrl).to.equal("businessSetup/partials/coachesView.html")}),it("should map to the correct controller",function(){expect(a.controller).to.equal("coachesCtrl")})}),describe("when navigating to businessSetup.locations",function(){var a;beforeEach(function(){$state.go("businessSetup.locations"),$rootScope.$digest(),a=$state.current.views["list-item-view"]}),it("should map to correct template",function(){expect(a.templateUrl).to.equal("businessSetup/partials/locationsView.html")}),it("should map to the correct controller",function(){expect(a.controller).to.equal("locationsCtrl")})}),describe("when navigating to businessSetup.scheduling",function(){var a;beforeEach(function(){$state.go("businessSetup.scheduling"),$rootScope.$digest(),a=$state.current.views["list-item-view"]}),it("should map to correct template",function(){expect(a.templateUrl).to.equal("businessSetup/partials/schedulingView.html")}),it("should map to the correct controller",function(){expect(a.controller).to.equal("schedulingCtrl")})})})}),describe("BusinessSetup Coach List",function(){var a,b;beforeEach(function(){b=$injector.get("coachSeekAPIService"),a=$rootScope.$new()}),describe("when the page loads",function(){var c,d,e,f,g,h="businessSetup/partials/coachesView.html";beforeEach(function(){g=this,g.let("coaches",function(){return[]}),e=this.sinon.stub(b,"getCoaches",function(){var a=$q.defer();return a.resolve(g.coaches),a.promise}),f=this.sinon.stub(b,"createCoach",function(){var a=$q.defer();return a.resolve([{}]),a.promise})}),it("should attempt to call getCoaches",function(){createViewWithController(a,h,"coachesCtrl"),expect(e).to.be.calledOnce}),describe("when getCoaches throws an error",function(){var c="errorMessage";beforeEach(function(){e.restore(),e=this.sinon.stub(b,"getCoaches",function(){var a=$q.defer();return a.reject(new Error(c)),a.promise})}),it("should throw",function(){expect(createViewWithController(a,h,"coachesCtrl")).to["throw"]}),it("should display an error message",function(){createViewWithController(a,h,"coachesCtrl"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+c+"-invalid")})}),describe("and there are no coaches",function(){beforeEach(function(){createViewWithController(a,h,"coachesCtrl"),d=$testRegion.find(".coach-item-view")}),it("should not show the coach list view",function(){expect($testRegion.find(".coach-list-view").hasClass("ng-hide")).to.be["true"]}),it("should show the coach edit view",function(){expect($testRegion.find(".coach-item-view").hasClass("ng-hide")).to.be["false"]}),it("should attempt to create a coach",function(){expect(f).to.be.calledOnce}),it("should not show the cancel button",function(){expect(d.find(".cancel-button").hasClass("ng-hide")).to.be["true"]})}),describe("and there are one or more coaches",function(){beforeEach(function(){g.let("firstCoach",function(){return{firstName:"Test",lastName:"User",email:"test@example.com",phone:"9090909"}}),g.let("coaches",function(){return[g.firstCoach,{}]}),createViewWithController(a,h,"coachesCtrl"),c=$testRegion.find(".coach-list-view"),d=$testRegion.find(".coach-item-view")}),it("should show the coach list view",function(){expect(c.hasClass("ng-hide")).to.be["false"]}),it("should have as many list entries as coaches",function(){expect(c.find(".coach-details").length).to.equal(g.coaches.length)}),it("should not show the coach edit view",function(){expect(d.hasClass("ng-hide")).to.be["true"]}),describe("when clicking the edit button",function(){beforeEach(function(){c.find(".edit-coach").first().trigger("click")}),it("should not show the coach list view",function(){expect(c.hasClass("ng-hide")).to.be["true"]}),it("should show the coach edit view",function(){expect(d.hasClass("ng-hide")).to.be["false"]}),it("should show the cancel button",function(){expect(d.find(".cancel-button").hasClass("ng-hide")).to.be["false"]}),describe("when clicking the save button",function(){var e;beforeEach(function(){e=this.sinon.stub(b,"saveCoach",function(){var a=$q.defer();return a.resolve([{}]),a.promise})}),describe("when saveCoach throws an error",function(){var a="errorMessage";beforeEach(function(){e.restore(),e=this.sinon.stub(b,"saveCoach",function(){var b=$q.defer();return b.reject(new Error(a)),b.promise})}),it("should throw",function(){expect(d.find(".save-coach").trigger("click")).to["throw"]}),it("should display an error message",function(){d.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+a+"-invalid")})}),describe("when the form is invalid",function(){describe("when the firstName is invalid",function(){it("should display an invalid input alert",function(){a.item.firstName=null,a.$apply(),d.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:firstName-invalid")})}),describe("when the lastName is invalid",function(){it("should display an invalid input alert",function(){a.item.lastName=null,a.$apply(),d.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:lastName-invalid")})}),describe("when the phone is invalid",function(){it("should display an invalid input alert",function(){a.item.phone=null,a.$apply(),d.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:phone-invalid")})}),describe("when the email is invalid",function(){it("should display an invalid input alert",function(){a.item.email="badEmail.com",a.$apply(),d.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:email-invalid")})}),describe("when a timeRange is invalid",function(){it("should display an invalid input alert",function(){a.itemForm.$setValidity("timeRange",!1),d.find(".save-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:timeRange-invalid")})})}),describe("when the coach name already exists",function(){beforeEach(function(){a.itemList.push(angular.copy(g.firstCoach)),d.find(".save-coach").trigger("click")}),it("should display an alert",function(){expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:name-already-exists")})}),describe("when the coach name is new",function(){beforeEach(function(){d.find(".save-coach").trigger("click")}),it("should attempt to save coach",function(){expect(e).to.be.calledOnce}),it("should show the coach list view",function(){expect(c.hasClass("ng-hide")).to.be["false"]}),it("should not show the coach edit view",function(){expect(d.hasClass("ng-hide")).to.be["true"]})})}),describe("when clicking the cancel button",function(){beforeEach(function(){a.item={firstName:"dumbnew",lastName:"userguy",email:"dude@dude.com",phone:"021 99 88 77"},a.$apply(),$rootScope.alerts.push({type:"warning",message:"test alert"}),d.find(".cancel-button").trigger("click")}),it("should reset all edits made",function(){var b=a.itemList.pop();expect(b.firstName).to.equal(g.firstCoach.firstName),expect(b.lastName).to.equal(g.firstCoach.lastName),expect(b.email).to.equal(g.firstCoach.email),expect(b.phone).to.equal(g.firstCoach.phone)}),it("should remove alert if present",function(){expect($rootScope.alerts.length).to.equal(0)})})}),describe("when creating a new coach",function(){var e;beforeEach(function(){e=a.itemList.length,c.find(".create-coach").trigger("click")}),it("should attempt to create a coach",function(){expect(f).to.be.calledOnce}),it("should not show the coach list view",function(){expect($testRegion.find(".coach-list-view").hasClass("ng-hide")).to.be["true"]}),it("should show the coach edit view",function(){expect($testRegion.find(".coach-item-view").hasClass("ng-hide")).to.be["false"]}),it("should show the cancel button",function(){expect(d.find(".cancel-button").hasClass("ng-hide")).to.be["false"]}),it("should set the newItem flag to true",function(){expect(a.newItem).to.be["true"]}),describe("when createCoach throws an error",function(){var a="errorMessage";beforeEach(function(){f.restore(),f=this.sinon.stub(b,"createCoach",function(){var b=$q.defer();return b.reject(new Error(a)),b.promise})}),it("should throw",function(){expect(c.find(".create-coach").trigger("click")).to["throw"]}),it("should display an error message",function(){c.find(".create-coach").trigger("click"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+a+"-invalid")})}),describe("when clicking the cancel button and coach is new",function(){beforeEach(function(){d.find(".cancel-button").trigger("click")}),it("should discard the new coach",function(){expect(a.itemList.length).to.equal(e)})})})}),describe("when navigating to services before adding a coach",function(){beforeEach(function(){createViewWithController(a,"businessSetup/partials/businessSetup.html","coachesCtrl"),$state.go("businessSetup.coachList"),a.$digest(),$state.go("businessSetup.services"),a.$digest()}),it("should not allow navigation",function(){expect($location.path()).to.equal("/business-setup/coach-list")}),it("should show a warning message",function(){expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:add-coach-warning")}),describe("after adding a coach",function(){beforeEach(function(){a.itemList=[{}],$state.go("businessSetup.services"),a.$digest()}),it("should allow navigation",function(){expect($location.path()).to.equal("/business-setup/services")})})})})}),describe("bussinessSetup Services",function(){var a,b,c,d,e,f="businessSetup/partials/servicesView.html";beforeEach(function(){e=$injector.get("coachSeekAPIService"),d=$rootScope.$new(),c=this,c.let("services",function(){return[]}),getServicesStub=this.sinon.stub(e,"getServices",function(){var a=$q.defer();return a.resolve(c.services),a.promise}),createServiceStub=this.sinon.stub(e,"createService",function(){var a=$q.defer();return a.resolve([{}]),a.promise})}),it("should make a call to getServices",function(){createViewWithController(d,f,"servicesCtrl"),expect(getServicesStub).to.be.calledOnce}),describe("when getServices throws an error",function(){var a="errorMessage";beforeEach(function(){getServicesStub.restore(),getServicesStub=this.sinon.stub(e,"getServices",function(){var b=$q.defer();return b.reject(new Error(a)),b.promise})}),it("should throw",function(){expect(createViewWithController(d,f,"servicesCtrl")).to["throw"]}),it("should display an error message",function(){createViewWithController(d,f,"servicesCtrl"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+a+"-invalid")})}),describe("and there are no services",function(){beforeEach(function(){createViewWithController(d,f,"servicesCtrl"),a=$testRegion.find(".service-item-view")}),it("should not show the service list view",function(){expect($testRegion.find(".service-list-view").hasClass("ng-hide")).to.be["true"]}),it("should show the service item view",function(){expect($testRegion.find(".service-item-view").hasClass("ng-hide")).to.be["false"]}),it("should attempt to create a service",function(){expect(createServiceStub).to.be.calledOnce}),it("should not show the cancel button",function(){expect(a.find(".cancel-service").hasClass("ng-hide")).to.be["true"]})}),describe("and there are one or more services",function(){beforeEach(function(){c.let("firstService",function(){return{name:"Test",description:"User",booking:{studentCapacity:8}}}),c.let("services",function(){return[c.firstService,{}]}),createViewWithController(d,f,"servicesCtrl"),b=$testRegion.find(".service-list-view"),a=$testRegion.find(".service-item-view")}),it("should show the service list view",function(){expect(b.hasClass("ng-hide")).to.be["false"]}),it("should have as many list entries as service",function(){expect(b.find(".service-details").length).to.equal(c.services.length)}),it("should not show the service item view",function(){expect(a.hasClass("ng-hide")).to.be["true"]}),describe("when clicking the edit button",function(){beforeEach(function(){b.find(".edit-service").first().trigger("click")}),it("should not show the service list view",function(){expect(b.hasClass("ng-hide")).to.be["true"]}),it("should show the service item view",function(){expect(a.hasClass("ng-hide")).to.be["false"]}),it("should show the cancel button",function(){expect(a.find(".cancel-service").hasClass("ng-hide")).to.be["false"]}),describe("when clicking the save button",function(){var f;beforeEach(function(){f=this.sinon.stub(e,"saveService",function(){var a=$q.defer();return a.resolve([{}]),a.promise})}),describe("when saveService throws an error",function(){var b="errorMessage";beforeEach(function(){f.restore(),f=this.sinon.stub(e,"saveService",function(){var a=$q.defer();return a.reject(new Error(b)),a.promise})}),it("should throw",function(){expect(a.find(".save-service").trigger("click")).to["throw"]}),it("should display an error message",function(){a.find(".save-service").trigger("click"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+b+"-invalid")})}),describe("when the form is invalid",function(){describe("when the name is invalid",function(){it("should display an invalid input alert",function(){d.item.name=null,d.$apply(),a.find(".save-service").trigger("click"),expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:name-invalid")})})}),describe("when the name already exists",function(){beforeEach(function(){d.itemList.push(angular.copy(c.firstService)),a.find(".save-service").trigger("click")}),it("should display an alert",function(){expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:name-already-exists")})}),describe("when the name is new",function(){beforeEach(function(){a.find(".save-service").trigger("click")}),it("should attempt to save coach",function(){expect(f).to.be.calledOnce}),it("should show the coach list view",function(){expect(b.hasClass("ng-hide")).to.be["false"]}),it("should not show the coach edit view",function(){expect(a.hasClass("ng-hide")).to.be["true"]})})}),describe("when clicking the cancel button",function(){beforeEach(function(){d.item={name:"dumbnew",description:"userguy"},d.$apply(),$rootScope.alerts.push({type:"warning",message:"test alert"}),a.find(".cancel-service").trigger("click")}),it("should reset all edits made",function(){var a=d.itemList.pop();expect(a.name).to.equal(c.firstService.name),expect(a.description).to.equal(c.firstService.description)}),it("should remove alert if present",function(){expect($rootScope.alerts.length).to.equal(0)})})}),describe("when creating a new service",function(){var c;beforeEach(function(){c=d.itemList.length,b.find(".create-service").trigger("click")}),it("should attempt to create a service",function(){expect(createServiceStub).to.be.calledOnce}),it("should not show the service list view",function(){expect($testRegion.find(".service-list-view").hasClass("ng-hide")).to.be["true"]}),it("should show the service item view",function(){expect($testRegion.find(".service-item-view").hasClass("ng-hide")).to.be["false"]}),it("should show the cancel button",function(){expect(a.find(".cancel-button").hasClass("ng-hide")).to.be["false"]}),it("should set the newItem flag to true",function(){expect(d.newItem).to.be["true"]}),describe("when createService throws an error",function(){var a="errorMessage";beforeEach(function(){createServiceStub.restore(),createServiceStub=this.sinon.stub(e,"createService",function(){var b=$q.defer();return b.reject(new Error(a)),b.promise})}),it("should throw",function(){expect(b.find(".create-service").trigger("click")).to["throw"]}),it("should display an error message",function(){b.find(".create-service").trigger("click"),expect($rootScope.alerts[0].type).to.equal("danger"),expect($rootScope.alerts[0].message).to.equal("businessSetup:"+a+"-invalid")})}),describe("when clicking the cancel button and coach is new",function(){beforeEach(function(){a.find(".cancel-service").trigger("click")}),it("should discard the new coach",function(){expect(d.itemList.length).to.equal(c)})})})}),describe("when navigating to scheduling before adding a service",function(){beforeEach(function(){createViewWithController(d,"businessSetup/partials/businessSetup.html","servicesCtrl"),$state.go("businessSetup.services"),d.$digest(),$state.go("businessSetup.scheduling"),d.$digest()}),it("should not allow navigation",function(){expect($location.path()).to.equal("/business-setup/services")}),it("should show a warning message",function(){expect($rootScope.alerts[0].type).to.equal("warning"),expect($rootScope.alerts[0].message).to.equal("businessSetup:add-services-warning")}),describe("after adding a service",function(){beforeEach(function(){d.itemList=[{}],$state.go("businessSetup.scheduling"),d.$digest()}),it("should allow navigation",function(){expect($location.path()).to.equal("/business-setup/scheduling")})})})}),describe("timePicker directive",function(){describe("when default time is provided",function(){var a;beforeEach(function(){a=$rootScope.$new(),this.let("testTime",function(){return"22:00"}),a.testTime=this.testTime,createDirective(a,'<div><time-picker time="testTime"></time-picker></div>')}),it("should set time to time provided",function(){expect(a.testTime).to.equal(this.testTime)}),describe("when clicking the increase hour button",function(){var b;beforeEach(function(){b=$testRegion.find(".increase .hours"),b.trigger("click")}),it("should add an hour to the set time",function(){expect(a.testTime).to.equal("23:00")})}),describe("when clicking the decrease hour button",function(){var b;beforeEach(function(){b=$testRegion.find(".decrease .hours"),b.trigger("click")}),it("should add an hour to the set time",function(){expect(a.testTime).to.equal("21:00")})}),describe("when clicking the increase minute button",function(){var b;beforeEach(function(){b=$testRegion.find(".increase .minutes")}),it("should increase the time by 15 minutes",function(){b.trigger("click"),expect(a.testTime).to.equal("22:15")})}),describe("when clicking the decrease minute button",function(){var b;beforeEach(function(){b=$testRegion.find(".decrease .minutes")}),it("should reduce the time by 15 minutes",function(){b.trigger("click"),expect(a.testTime).to.equal("21:45")})})})}),describe("timeSlot directive",function(){var a;beforeEach(function(){a=$rootScope.$new(),a.weekdays=["monday","tuesday","wednesday"],a.item={firstName:"NEWEST",lastName:"USER",email:"aaron.smith@example.com",phone:"021 99 88 77",workingHours:{monday:{isAvailable:!0,startTime:"11:00",finishTime:"11:00"},tuesday:{isAvailable:!1},wednesday:{isAvailable:!0}}},createDirective(a,"<div><time-slot></time-slot></div>")}),it("should have as many entries as days",function(){var b=$testRegion.find(".weekday");expect(b.length).to.equal(_.size(a.item.workingHours))}),describe("when a day is available",function(){it("should enable the time spinner",function(){var a=$testRegion.find(".weekday").first();expect(a.find("time-range-picker").attr("disabled")).to.equal(void 0)})}),describe("when a day is unavailable",function(){it("should disable the time spinner",function(){var a=$testRegion.find(".weekday:nth-child(2)");expect(a.find("time-range-picker").attr("disabled")).to.equal("disabled")})}),describe("when clicking on the toggle available switch",function(){var b;beforeEach(function(){var a=$testRegion.find(".weekday").first();b=a.find(".toggle-switch"),b.trigger("click")}),it("should set isAvailable to false",function(){expect(a.item.workingHours.monday.isAvailable).to.be["false"]}),it("the day should be valid",function(){var a=$testRegion.find("time-range-picker").first();expect(a.hasClass("ng-invalid")).to.be["false"]}),describe("when clicking on the toggle available switch again",function(){it("should set isAvailable to true",function(){b.trigger("click"),expect(a.item.workingHours.monday.isAvailable).to.be["true"]}),it("the day should be invalid",function(){b.trigger("click");var a=$testRegion.find("time-range-picker").first();expect(a.hasClass("ng-invalid")).to.be["true"]})})}),describe("time validation",function(){describe("when times are the same",function(){it("the day should be invalid",function(){var a=$testRegion.find("time-range-picker").first();expect(a.hasClass("ng-invalid")).to.be["true"]})}),describe("when there is negative time between the times",function(){it("the day should be invalid",function(){a.item.workingHours.monday.startTime="12:00",a.$apply();var b=$testRegion.find("time-range-picker").first();expect(b.hasClass("ng-invalid")).to.be["true"]
})}),describe("when there is ample time between times",function(){it("the day should be vaild",function(){a.item.workingHours.monday.startTime="9:00",a.$apply();var b=$testRegion.find("time-range-picker").first();expect(b.hasClass("ng-invalid")).to.be["false"]})})})});