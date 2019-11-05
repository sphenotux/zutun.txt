import QtQuick 2.0
import QtQml.Models 2.1

import "qrc:/"
import "../tdt/todotxt.js" as JS

DelegateModel {
    id: visualModel

    signal sortFinished()

    property string defaultPriority: "F"

    property var lessThanFunc: function (left, right) {
        return false
    }

    property var visibility: function (item) {
        return true
    }

    property var getSectionFunc: function (text) {
        return []
    }

    function addTaskItem(data) {
        //console.log("diesdas")

        items.insert(0, data)
        var newItem = items.create(0)
        newItem.state = "add"
        //console.log(newItem.state, newItem.item)
        newItem.item.forceActiveFocus()
    }

    function cancelAdd() {
        items.remove(0, 1)
    }

    //return the positon of the item in the list due to function lessThanFunc
    function insertPosition(lessThanFunc, item) {
        var lower = 0
        var upper = items.count
        while (lower < upper) {
            var middle = Math.floor(lower + (upper - lower)/2)
            var result =
                    lessThanFunc(
                        (item.model ? item.model : item), items.get(middle).model)
            if (result) {
                upper = middle
            } else {
                lower = middle + 1
            }
        }
        return lower
    }

    function sort(lessThan) {
        //console.log("sorting", unsortedItems.count)
        while (unsortedItems.count > 0) {
            var item = unsortedItems.get(0)
            //console.log(item.model.index, item.groups, item.isUnresolved)
            //model.get(item.model.index).section = getSectionFunc(item.model.fullTxt).join(', ')
            model.get(item.model.index).section = sorting.groupFunctionList[sorting.grouping][2](item.model.fullTxt).join(', ')
            if (visibility(item.model)) {
                if (item.model.priority.charCodeAt(0) > defaultPriority.charCodeAt(0)) defaultPriority = item.model.priority
                var index = insertPosition(lessThan, item)
                item.groups = ["items"]
                items.move(item.itemsIndex, index)
            } else item.groups = "invisible"
        }
        sortFinished()
    }

    function resort() {
        console.log("resort called", sorting.grouping)
        if (items.count > 0) items.setGroups(0, items.count, "unsorted")
        if (invisibleItems.count > 0) invisibleItems.setGroups(0, invisibleItems.count, "unsorted")
    }

    items.includeByDefault: false
    groups: [
        DelegateModelGroup {
            id: unsortedItems
            name: "unsorted"
            includeByDefault: true
            onChanged: {
                visualModel.sort(sorting.groupFunctionList[sorting.grouping][1]) // changed too late ?? lessThanFunc)
            }
        },
        DelegateModelGroup {
            id: invisibleItems
            name: "invisible"
        }
    ]
}
