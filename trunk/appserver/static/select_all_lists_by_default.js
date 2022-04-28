var deps = [
    "splunkjs/ready!"
];
require(deps, function (mvc) {
    var defaultTokenModel = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');

    var idSelectIndex = mvc.Components.get('idSelectIndex');
    var allValues = [];

    console.log(mvc.Components.allValues);
    var idSearchSelectIndex = mvc.Components.get("idSearchSelectIndex");
    var idSearchSelectIndex_results = idSearchSelectIndex.data("results");
    idSearchSelectIndex_results.on("data", function () {
        console.log('updated');
        var allValues = [];
        $.each(idSearchSelectIndex_results.data().rows, function (index, value) {
            allValues.push(value[0]);
        });
        idSelectIndex.settings.set("default", allValues);
    });
});
