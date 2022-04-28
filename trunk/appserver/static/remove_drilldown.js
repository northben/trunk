require([
  'underscore',
  'jquery',
  'splunkjs/mvc',
  'splunkjs/mvc/tableview',
  'splunkjs/mvc/simplexml/ready!'
], function (_, $, mvc, TableView) {
  var service = mvc.createService()

var tables = [];

for(let obj in splunkjs.mvc.Components.attributes){
    if(splunkjs.mvc.Components.attributes[obj].el){
        if($(splunkjs.mvc.Components.attributes[obj].el).is(".table")){
          tables.push(obj);
        }
    }
}



})
