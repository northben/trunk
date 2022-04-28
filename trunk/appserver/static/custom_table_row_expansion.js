require([
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc',
    'underscore',
    'splunkjs/mvc/simplexml/ready!'], function (
        TableView,
        SearchManager,
        mvc,
        _
    ) {
    var EventSearchBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
        initialize: function (args) {
            // initialize will run once, so we will set up a search and a chart to be reused.
            this._searchManager = new SearchManager({
                id: 'details-search-manager',
                preview: false
            });
            this._tableView = new TableView({
                managerid: 'details-search-manager',
                wrap: 'true',
                drilldown: 'row'
            });

            this._tableView.on("click", function (f) {

                f.preventDefault();
                console.log("clicked!");
                console.log(f.data["row.action_data_card_shortLink"]);
                var url = "https://trello.com/c/" + f.data["row.action_data_card_shortLink"];
                console.log(url);
                window.open(url, '_blank');
                window.focus();
            });


        },
        canRender: function (rowData) {
            // Since more than one row expansion renderer can be registered we let each decide if they can handle that
            // data
            // Here we will always handle it.
            return true;
        },
        render: function ($container, rowData) {
            // rowData contains information about the row that is expanded.  We can see the cells, fields, and values
            // We will find the sourcetype cell to use its value
            var sourcetypeCell = _(rowData.cells).find(function (cell) {
                return cell.field === 'action_data_card_shortLink';
            });
            //update the search with the sourcetype that we are interested in
            var query = 'action_data_card_shortLink IN (' + sourcetypeCell.value + ') | `get_card_labels` | `get_checklist_status` | `get_card_details` | replace "*\\\'*" with "*\'*" in action_data_card_name Description | table Date label list_name action_data_card_name Description action_data_card_shortLink';
            console.log(query);
            this._searchManager.set({ search: query });
            // $container is the jquery object where we can put out content.
            // In this case we will render our chart and add it to the $container
            $container.append(this._tableView.render().el);
        }
    });
    var tableElement = mvc.Components.getInstance("expand_with_events");
    console.log("here");
    console.log(tableElement);
    tableElement.getVisualization(function (tableView) {
        // Add custom cell renderer, the table will re-render automatically.
        tableView.addRowExpansionRenderer(new EventSearchBasedRowExpansionRenderer());
    });

});
