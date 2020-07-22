import QtQuick 2.0
import Sailfish.Silica 1.0
import Nemo.Configuration 1.0
import Nemo.DBus 2.0

import "components"
import "pages"
import "tdt"

import "tdt/todotxt.js" as JS

//TODO archive to done.txt
//TODO fehler über notifiactions ausgeben
//TODO more verbose placeholder in tasklist

ApplicationWindow {
    id: app

    initialPage: Component { TaskListPage{} }

    cover: Qt.resolvedUrl("cover/CoverPage.qml")
    allowedOrientations: Orientation.All
    _defaultPageOrientations: Orientation.All

    ConfigurationGroup {
        id: settings
        path: "/apps/harbour-zutun/settings"
        property string todoTxtLocation: StandardPaths.documents + '/todo.txt'
        property string doneTxtLocation: StandardPaths.documents + '/done.txt'
        //property alias autoSave: file.autoSave
        property int fontSizeTaskList: Theme.fontSizeMedium
        property bool projectFilterLeft: false
        property bool creationDateOnAddTask: false
        property bool showSearch: false
        property ConfigurationValue notificationIDs: ConfigurationValue {
            key: settings.path + "/notificationIDs"
            defaultValue: []
        }
        ConfigurationGroup {
            id: filterSettings
            path: "/filters"
            property bool hideDone: true
            property ConfigurationValue projects: ConfigurationValue {
                key: filterSettings.path + "/projects"
                defaultValue: []
            }
            property ConfigurationValue contexts: ConfigurationValue {
                key: filterSettings.path + "/contexts"
                defaultValue: []
            }
        }

        ConfigurationGroup {
            id: sortSettings
            path: "sorting"
            property bool asc: false
            property int order: 0
            property int grouping: 0
        }
    }

    DBusAdaptor {
        id: dbusAdaptor

        service: 'info.fuxl.zutuntxt'
        iface: 'info.fuxl.zutuntxt'
        path: '/info/fuxl/zutuntxt'

        function addTask() {
            app.addTask("")
        }

        function showApp() {
            app.activate()
            notificationList.publishNotifications()
        }
    }

    function addTask(text) {
        //safety check text
        if (typeof text !== "String") text = ""
        pageStack.pop(pageStack.find(function(p){ return (p.name === "TaskList") }), PageStackAction.Immediate)
        pageStack.push(Qt.resolvedUrl("./pages/TaskEditPage.qml"), {itemIndex: -1, text: text})
        app.activate()
    }

    property bool busy: todoTxtFile.busy //|| taskListModel.busy

    FileIO {
        id: todoTxtFile
        property string hintText: ""
        path: settings.todoTxtLocation
        onPathChanged: read()

        onReadSuccess:
            if (content) {
                taskListModel.setFileContent(content)
            }

        onIoError: {
            //TODO needs some rework for translation
            hintText = msg
        }
        onPythonReadyChanged: if (pythonReady) read()
    }

    NotificationList {
        id: notificationList
        ids: settings.notificationIDs.value
        taskList: taskListModel
    }

    SortFilterModel {
        id: visualModel
        model: taskListModel
        visibilityFunc: taskListModel.filters.visibility
        lessThanFunc: taskListModel.sorting.lessThanFunc
        delegate: Delegate {}
    }

    TaskListModel {
        id: taskListModel

        onSaveTodoTxtFile: todoTxtFile.save(content)
        onTaskListDataChanged: notificationList.publishNotifications()

        Component.onCompleted: {
            JS.tools.projectColor = Theme.highlightColor
            JS.tools.contextColor = Theme.secondaryHighlightColor
        }

        filters {
            hideDone: filterSettings.hideDone
            projects: filterSettings.projects.value
            contexts: filterSettings.contexts.value
            onFiltersChanged: visualModel.update()
        }

        sorting {
            asc: sortSettings.asc
            order: sortSettings.order
            groupBy: sortSettings.grouping
            onSortingChanged: visualModel.update()
        }
    }

    onActiveFocusChanged: {
        if (activeFocus) {
            //console.log("app", activeFocus)
            todoTxtFile.read()
        }
    }
}



