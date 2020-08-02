.pragma library

var tools = {
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    urlPattern: /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
    mailPattern: /([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)/ig,
    // colors for priorities: aus ColorPicker.qml:
    prioColors: ["#e60003", "#e6007c", "#e700cc", "#9d00e7",
        "#7b00e6", "#5d00e5", "#0077e7", "#01a9e7",
        "#00cce7", "#00e696", "#00e600", "#99e600",
        "#e3e601", "#e5bc00", "#e78601"],
    //return color for given priority A,B,C...
    prioColor: function(prio) {
        return tools.prioColors[tools.alphabet.search(prio) % tools.prioColors.length]
    },
    projectColor: "red",
    contextColor: "blue",
    //return text with html tags around email addresses
    linkify: function(text) {
        text = text.replace(tools.mailPattern, function(url) {
            return '<a href="mailto:' + url + '">' + url + '</a>'
        });
        return text.replace(tools.urlPattern, function(url) {
            return '<a href="' + url + '">' + url + '</a>'
        });
    },
    //get today's date in iso format
    today: function() {
        return Qt.formatDate(new Date(),"yyyy-MM-dd")
    },
    //iso formatted date to Date object
    isoToDate: function(text, format) {
        return (Date.fromLocaleString(Qt.locale("en_US"), text, "yyyy-MM-dd")).toLocaleDateString(Qt.locale(), format)
    },
    //return JSON item for textline
    lineToJSON: function(line) {
        var item = baseFeatures.parseLine(line)

        var displayText = tools.linkify(item.subject)
        displayText = displayText.replace(
                    projects.pattern,
                    function(x) { return ' <font color="' + tools.projectColor + '">' + x + ' </font>'})
        displayText = displayText.replace(
                    contexts.pattern,
                    function(x) { return ' <font color="' + tools.contextColor + '">' + x + ' </font>'})
        displayText = (item.priority !== "" ?
                           '<font color="' + tools.prioColor(item.priority) + '">(' + item.priority + ') </font>' : "")
                + displayText //item.subject //+ '<br/>' +item.creationDate

        item["formattedSubject"] = displayText

        //item["section"] = ""
        item["projects"] = projects.getList(line).join(", ")
        item["contexts"] = contexts.getList(line).join(", ")

        return item
    },
    //return array of tasks
    splitLines: function(text) {
        var tasks = []
        var lines = text.split("\n")
        var txt = ""
        lines.forEach(function(line){
            txt = line.trim()
            if (txt.length !== 0) tasks.push(txt)
        })
        return tasks
    }
}

var baseFeatures = {
    //see https://github.com/todotxt/todo.txt

    // fullTxt, complete, priority, (completionDate or creationDate), creationDate, subject
    pattern: /^(x\s)?(\([A-Z]\)\s)?(\d{4}-\d{2}-\d{2}\s)?(\d{4}-\d{2}-\d{2}\s)?(.*)/ ,
    datePattern: /^\d{4}-\d{2}-\d{2}$/,

    //indices of matches in pattern
    fullTxt: 0,
    done: 1,
    priority: 2,
    completionDate: 3,
    creationDate: 4,
    subject: 5,

    //returns array of matches
    getMatches: function(line) {
        var matches = line.match(this.pattern)
        if (matches[this.done] === undefined && matches[this.creationDate] === undefined)
            //swap creationDate, completionDate
            matches[this.creationDate] = matches.splice(this.completionDate, 1, matches[this.creationDate])[0]
        return matches
    },

    //returns JSON object of a task
    parseLine: function(line) {
        //baseFeatures
        var fields = this.getMatches(line)
        var values = {
            fullTxt: fields[this.fullTxt],
            done: fields[this.done] !== undefined,
            priority: (fields[this.priority] !== undefined ?
                           fields[this.priority].charAt(1) : ""),
            //wenn creationDate auch gesetzt, im Feld completionDate
            completionDate: (fields[this.completionDate] !== undefined ? fields[this.completionDate] : "").trim(),
            //wenn creationDate leer, im Feld completionDate enthalten
            creationDate: (fields[this.creationDate] !== undefined ? fields[this.creationDate]: "").trim(),
            subject: fields[this.subject].trim()
        }

        //projects
//        values['projects'] = projects.listLine(line)
//        console.log(line, projects.listLine(line))

        //contexts
        //values['contexts'] = contexts.list([line])

        //due
        var dueFields = due.get(values.subject)
        values.subject = dueFields[due.subject]
        values['due'] = dueFields[due.date]

        return values
    },

    modifyLine: function(line, feature, value) {
        //TODO validierung von value???
        console.debug(line, feature, value)
        var fields = this.getMatches(line)
        //        console.log(fields)
        switch (feature) {
        case this.fullTxt :
            return value
        case this.done :
            if (value === false) {
                fields[feature] = undefined
                fields[this.completionDate] = undefined
            } else {
                fields[feature] = "x "
                fields[this.completionDate] = tools.today() + " "
            }
            break
        case this.priority:
            if (value === false || value === "") { fields[feature] = undefined; break }
            else if (tools.alphabet.indexOf(value) > -1) { fields[feature] = "(" + value + ") "; break }
            break
        case this.creationDate:
            if (value === false) fields[feature] = undefined
            else if (this.datePattern.test(value)) fields[feature] = value + " "
            else if (value instanceof Date) fields[feature] = Qt.formatDate(value, 'yyyy-MM-dd') + " "
            break
        }
        fields[this.fullTxt] = undefined
        //        console.log(fields)
        return fields.join("")
    }
}

function getMatchesList2(text, pattern) {
    if (Array.isArray(text)) text = text.join("\n")

    var matchesList = []
    var matches = text.match(pattern)
    //console.debug("matches", matches)

    if (!matches) return []
    matches.forEach(function(match){
        match = match.trim()
        if (matchesList.indexOf(match) === -1) matchesList.push(match)
    })
    matchesList.sort()
    //console.debug("matcheslist", matchesList)
    return matchesList;
}

var projects = {
    pattern: /(^|\s)(\+\S+)/g ,
    /* get list of contexts for text*/
    getList: function(text) {
        return getMatchesList2(text, this.pattern)
    }
}

var contexts = {
    pattern: /(^|\s)\@\S+/g ,
    /* get list of contexts for text*/
    getList: function(text) {
        return getMatchesList2(text, this.pattern)
    }
}

var due = {
    datePattern: /^\d{4}-\d{2}-\d{2}$/,
    pattern: /(^|\s)due:\d{4}-\d{2}-\d{2}(\s|$)/,
    subjectPattern: /(^|.*\s)due:(\d{4}-\d{2}-\d{2})(\s.*|$)/,

    //indices
    date: 0,
    subject: 1,

    set: function(task, date) {
        var dueStr = "due:";
        if (typeof date === "string" && due.datePattern.test(date)) {
            dueStr += date.trim()
        } else if (date instanceof Date) {
            dueStr += Qt.formatDate(date, 'yyyy-MM-dd')
        }
        if (due.pattern.test(dueStr))  {
            if (due.pattern.test(task))
                return task.replace(due.pattern, " " + dueStr + " ");
            else
                return task + " " + dueStr.trim()
        } else if (date === "") {
            return task.replace(due.pattern, "");
        }
    },
    get: function(subject) {
        var dueDate = "";
        if (due.subjectPattern.test(subject)) {
            var matches = subject.match(due.subjectPattern)
            dueDate = matches[2];
            subject = matches[1].trim() + " " + matches[3].trim()
        }
        return [dueDate, subject]
    }
}
