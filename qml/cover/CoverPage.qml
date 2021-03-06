import QtQuick 2.0
import Sailfish.Silica 1.0

CoverBackground {
    id: cb
    Image {
        source: "coversmall.png"
        anchors.centerIn: parent
        opacity: 0.2
        anchors.fill: parent
        fillMode: Image.PreserveAspectFit
    }

    Column {
        anchors.fill: parent
        anchors.margins: Theme.paddingMedium
        Repeater {
            model: ttm1.tasks
            Label {
                //x: Theme.paddingMedium
                text: model.displayText
                width: cb.width - 2*x
                truncationMode: TruncationMode.Elide
            }
        }
    }

    CoverActionList {
        CoverAction {
            iconSource: "image://theme/icon-cover-new"
            onTriggered: {
                app.addTask();
            }
        }
    }

    onStatusChanged: {
        if (status === Cover.Active ) {
            ttm1.reloadFile();
        }
    }
}


