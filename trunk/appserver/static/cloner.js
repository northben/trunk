require([
    "underscore",
    "jquery",
    "splunkjs/mvc",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/simplesplunkview",
    "splunkjs/mvc/simplexml/ready!"
], function(_, $, mvc, TableView, SimpleSplunkView) {

    var cardList = splunkjs.mvc.Components.get("card_list");

    var tokenModel = mvc.Components.get('default');

    var service = mvc.createService();

    var CustomIconRenderer = TableView.BaseCellRenderer.extend({
            canRender: function(cell) {
                return /clone_\w+/.test(cell.field) === true;
            },
            render: function($td, cell) {
                $td.addClass('icon-inline').html(_.template('<%- text %> <i class="icon-<%-icon%>"></i>', {
                    icon: "share",
                    text: "",
                }));
            }
        });

    cardList.getVisualization(function(tableView){
      tableView.addCellRenderer(new CustomIconRenderer());
      tableView.settings.set("pageSize", 1000000);
    });


    cardList.on("click", function(f) {

        f.preventDefault();

        if (f.data['click.name2'] == "Activity") {
          var url = "https://trello.com/c/" + f.data['row.action_data_card_shortLink'];
          var win = window.open(url, "_blank");
          win.focus;
        }

        if (tokenModel.get('target_list') == null) {
          alert("You did not select a target list!");
        }

        if (tokenModel.get('target_board') == null) {
          alert("You did not select a target board!");
        }

        var data = {};

        if (f.data['click.name2'] == "clone_comment") {
          data.comment = f.data['row.comment'];
        };

        if (f.data['click.name2'] == "clone_SOW") {
          data.comment = f.data['row.comment'];
          data.label = f.data['row.SOW'];
        };

        if (/clone_\w+/.test(f.data['click.name2']) == true) {
          data.title = f.data['row.Activity'];
          data.target_board = tokenModel.get('target_board');
          data.target_list = tokenModel.get('target_list');

          service.post('/services/create_trello_card', data, function(err, response) {

            if(err) {
              console.log('error: ', err);
            }
            else if(response.status === 200) {
              var jsonResponse = JSON.parse(response.data);
              var modalHtml = '<div class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class=modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>Card cloned successfully</h3></div><div class="modal-body">View card: <a href="https://trello.com/c/' + jsonResponse.shortLink + '" target="_blank">' + jsonResponse.name + '</a></div><div class="modal-footer">    <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button></div></div>';
              var $modal = $(modalHtml).appendTo('body').modal("toggle");
            }

          });

        };

    });

    var theDiv = $('#filterField');

    var theInput = theDiv.find('input');

    theDiv.keyup(function(d){

        var filter = theInput[0].value.toUpperCase();
        console.log(filter);

        var theTable = document.getElementById("card_list");
        var tr = theTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

        for (i = 0; i < tr.length; i++) {
          var td = tr[i].getElementsByTagName("td");
          for (j = 0; j < td.length; j++) {
            var foundMatch;
            if (td[j].innerHTML.toUpperCase().search(filter) > -1) {
              foundMatch = true;
            }
          }

          if (foundMatch) {
              tr[i].style.display = "";
              foundMatch = false;
          }
          else {
              tr[i].style.display = "none";
          }
        }

    });

});

