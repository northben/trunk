require([
  "underscore",
  "jquery",
  "/en-US/static/app/trunk/marked.min.js",
  "splunkjs/mvc",
  "splunkjs/mvc/tableview",
  "splunkjs/mvc/simplexml/ready!"
], function (_, $, marked, mvc, TableView) {

  marked.setOptions({
    gfm: true,
    breaks: true
  });

  var taskTable = splunkjs.mvc.Components.get("tasks");
  var recommendationTable = splunkjs.mvc.Components.get("recommendations");
  var blockerTable = splunkjs.mvc.Components.get("issues");
  var wipTable = splunkjs.mvc.Components.get("wipTable");

  var CustomCellRenderer = TableView.BaseCellRenderer.extend({
    canRender: function (cellData) {
      return cellData.field != 'list_name';
      //return cellData.field !== 'list_name' || cellData.field === 'Info' || cellData.field === 'Details' || cellData.field === 'Remediation';
      //return true;
    },

    render: function ($td, cellData) {
      if (!!cellData.value) {

        var foo = cellData.value;

        if (foo.constructor.name == "Array") {

          foo = foo.join("\n---\n");

        }
        $td[0].innerHTML = marked(foo);

        $td[0].innerHTML = $td[0].innerHTML.replace(/\\"/g, '"');
        $td[0].innerHTML = $td[0].innerHTML.replace(/\\'/g, "'");
        $td[0].innerHTML = $td[0].innerHTML.replace(/\<br\>+/g, "\r");

        // add extra line break for MS Word mail merge
        $td[0].innerHTML = $td[0].innerHTML.replace(/\<\/p\>/g, "\<\/p\>\r\r");
      }
    }
  });

  var myCellRenderer = new CustomCellRenderer();

  if (typeof taskTable != "undefined") {
    taskTable.getVisualization(function (tableView) {
      tableView.table.addCellRenderer(myCellRenderer);
      tableView.render();
    });
  }
  if (typeof recommendationTable != "undefined") {
    recommendationTable.getVisualization(function (tableView) {
      tableView.table.addCellRenderer(myCellRenderer);
      tableView.render();
    });
  }
  if (typeof blockerTable != "undefined") {
    blockerTable.getVisualization(function (tableView) {
      tableView.table.addCellRenderer(myCellRenderer);
      tableView.render();
    });
  }
  if (typeof wipTable != "undefined") {
    wipTable.getVisualization(function (tableView) {
      tableView.table.addCellRenderer(myCellRenderer);
      tableView.render();
    });
  }

});
