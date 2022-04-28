require([
    "splunkjs/mvc",
    "splunkjs/mvc/simplexml/ready!"
], function(mvc) {

    var myTable= mvc.Components.get('unlimited_rows');

    myTable.getVisualization(function(tableView) {
        tableView.settings.set({
            "pageSize": "10000",
        });
    });

});
