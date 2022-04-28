require([
  'underscore',
  'jquery',
  '/en-US/static/app/trunk/marked.min.js',
  'splunkjs/mvc',
  'splunkjs/mvc/tableview',
  'splunkjs/mvc/simplexml/ready!'
], function (_, $, marked, mvc, TableView) {
  var service = mvc.createService()

  var CustomCellRenderer = TableView.BaseCellRenderer.extend({
    canRender: function (cellData) {
      return true
    },

    render: function ($td, cellData) {
      if (cellData.value) {
        var foo = cellData.value

        if (foo.constructor.name == 'Array') {
          foo = foo.join('\n')
        }

	foo = marked(foo)
        $td[0].innerHTML = foo.trim()

      //  $td[0].innerHTML = $td[0].innerHTML.replace(/\\"/g, '"')
       // $td[0].innerHTML = $td[0].innerHTML.replace(/\\'/g, "'")
        //$td[0].innerHTML = $td[0].innerHTML.replace(/[\r\n]+/g, '')
      }
    }
  })

  for (const obj in splunkjs.mvc.Components.attributes) {
    const id = splunkjs.mvc.Components.attributes[obj].id

    if (
      typeof id === 'string' &&
      id.includes('markdown') &&
      $(splunkjs.mvc.Components.attributes[obj].el).is('.table')
    ) {
      var myCellRenderer = new CustomCellRenderer()

      thisTable = splunkjs.mvc.Components.get(id)
      thisTable.getVisualization(function (tableView) {
        tableView.addCellRenderer(myCellRenderer)
        tableView.render()
      })
    }
  }
})

