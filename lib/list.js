
function getCommunityLabel(id) {
    var label = ffmapConfig.community_labels[id.toLowerCase()];
    return label ? label : id;
}
function eui6_address(prefix, mac) {
    prefix = prefix.substring(0, prefix.length - 1); // hack: cut off last :
    var m = mac.split(":");

    /* convert to globally administered MAC address */
    m[0] = (parseInt(m[0], 16) ^ 2).toString(16);

    return prefix + m[0] + m[1] + ":" + m[2] + "ff:fe" + m[3] + ":" + m[4] + m[5];
}
function nodetable(table, fn) {
    var thead, tbody, tfoot

    function prepare() {
        thead = table.append("thead")
        tbody = table.append("tbody")
        tfoot = table.append("tfoot")

        var tr = thead.append("tr")

        tr.append("th").text("Name")
        tr.append("th").text("Status")
        tr.append("th").text("Clients")
        tr.append("th").text("WLAN Links")
        tr.append("th").text("VPN")
        tr.append("th").text("Geo")
        tr.append("th").text("Firmware")
        tr.append("th").text("Community")
    }

    function sum(arr, attr) {
        return arr.reduce(function(old, node) {
            return old + node[attr]
        }, 0)
    }

    function update(data) {
        var non_clients = data.nodes.filter(function(d) {
            return !d.flags.client
        })
        var doc = tbody.selectAll("tr").data(non_clients)

        var row = doc.enter().append("tr")

        row.classed("online", function(d) {
            return d.flags.online
        })

        row.append("td").text(function(d) {
            return d.name ? d.name : d.id
        })
        row.append("td").append("a")
            .attr("target", "_blank")
            .attr("href",function(d) {
                return  "http://[" + eui6_address(ffmapConfig.prefix6, d.id) + "]/"
            })
            .text(function(d) {
                return d.flags.online ? "online" : "offline"
            })
        row.append("td").text(function(d) {
            return (d.clientcount || 0)
        })
        row.append("td").text(function(d) {
            return d.wifilinks.length
        })
        row.append("td").text(function(d) {
            return d.vpns.length
        })
        row.append("td").text(function(d) {
            return d.geo ? "ja" : "nein"
        })
        row.append("td").text(function(d) {
            return (d.firmware || "")
        })
        row.append("td").text(function(d) {
            return (d.community ? getCommunityLabel(d.community) : "")
        })

        var foot = tfoot.append("tr")
        foot.append("td").text("Summe")
        foot.append("td").text(non_clients.reduce(function(old, node) {
            return old + node.flags.online
        }, 0) + " / " + non_clients.length)
        foot.append("td").text(non_clients.reduce(function(old, node) {
            return old + (node.clientcount || 0)
        }, 0))
        foot.append("td").attr("colspan", 4).style("text-align", "right").text("Zuletzt aktualisiert: " + (new Date(data.meta.timestamp + 'Z')).toLocaleString())

        $("#list").tablesorter({
            sortList: [
                [0, 0]
            ]
        })
    }

    var data

    function fetch(fn) {
        load_nodes(fn, data, update)
    }

    prepare()

    fetch(fn)
}

function init() {
    document.getElementById("community_site").innerHTML = ffmapConfig.community_site;
    document.title = ffmapConfig.community_name + " -  " + document.title;

    table = nodetable(d3.select("#list"), ffmapConfig.nodes_json)
    adjust_navigation()
}
