let cards = {};
let markers = {};
let format = {};
let tree = null;
let picker = new DatePicker();
let calendar = new Calendar($('#calendar-container-days')[0], 80);

let year = null;
let month = null;

var ACCOUNTS_MENU = {
    'context1': {
        elements: [{
                text: 'Account Actions',
                icon: 'assets/images/folder-icon.png',
                action: function(node) {},
                submenu: {
                    elements: [{
                            text: 'Toggle Node',
                            icon: 'assets/images/toggle-icon.png',
                            action: function(node) {
                                node.toggleNode();
                            }
                        },
                        {
                            text: 'Expand Subtree',
                            icon: 'assets/images/down-icon.png',

                            action: function(node) {

                                node.expandSubtree();

                            }

                        },
                        {
                            text: 'Collapse Subtree',
                            icon: 'assets/images/up-icon.png',
                            action: function(node) {
                                node.collapseSubtree();

                            }
                        },
                        {
                            text: 'Rename Node',
                            icon: 'assets/images/rename-icon.png',
                            action: function(node) {
                                node.editNode();
                            }

                        },

                    ]
                }

            },
            {
                text: 'Child Actions',
                icon: 'assets/images/document-icon.png',
                action: function(node) {},
                submenu: {
                    elements: [{
                            text: 'Create Child Node',
                            icon: 'assets/images/add-icon.png',
                            action: function(node) {
                                node.createChildNode('[account]', false, "assets/images/document-icon.png", null, "context2");
                            }
                        },
                        {
                            text: 'Delete Child Nodes',
                            icon: 'assets/images/delete-icon.png',
                            action: function(node) {
                                node.removeChildNodes();

                            }

                        }

                    ]

                }

            }

        ]

    },
    'context2': {
        elements: [{
                text: 'Rename Node',
                icon: 'assets/images/rename-icon.png',
                action: function(node) {
                    node.editNode();
                }

            },
            {
                text: 'Delete Node',
                icon: 'assets/images/delete-icon.png',
                action: function(node) {
                    node.removeNode();
                }

            },
            {
                text: 'Create Child Node',
                icon: 'assets/images/add-icon.png',
                action: function(node) {
                    node.createChildNode('[account]', false, "assets/images/document-icon.png", null, "context2");
                    node.setIcon('assets/images/folder-icon.png');
                }
            }
        ]

    }

};

let CALLBACKS = {

    onclick: function(node) {
        $('#receipt-container').html('');
        let template = $('script[data-template="card-item"]').text();

        for (let id in cards[node.id]) {

            let value = $(this).Substitute(template, {
                id: id,
                merchant: cards[tree.selectedNode.id][id].merchant,
                amount: cards[tree.selectedNode.id][id].amount,
                date: cards[tree.selectedNode.id][id].date,
                type: cards[tree.selectedNode.id][id].type,
                icon: cards[tree.selectedNode.id][id].type == 'income' ? 'fa-piggy-bank' : 'fa-donate'
            });

            $('#receipt-container').html($('#receipt-container').html() + value);

        }

        for (let id in cards[node.id]) {
            picker.decorate(document.getElementById(`date-${id}`));
        }

    },

    addchild: function(node) {
        node.setIcon('assets/images/folder-icon.png');
    },

    removechild: function(node) {

        if (node.childNodes.length == 0) {
            node.setIcon('assets/images/document-icon.png');
        } else {
            node.setIcon('assets/images/folder-icon.png');
        }

    }

};

function updateDate(element, date) {

    calendar.setEnabled(date);

}

$("#window-minimize").on('click', async(e) => {

    window.api.minimize();

});

$("#window-maximize").on('click', async(e) => {
    var isMaximized = window.api.isMaximized();

    if (!isMaximized) {
        $("#window-maximize").addClass("fa-window-restore");
        $("#window-maximize").removeClass("fa-square");
        window.api.maximize();
    } else {
        $("#window-maximize").removeClass("fa-window-restore");
        $("#window-maximize").addClass("fa-square");
        window.api.unmaximize();
    }

});

$("#quit").on('click', async(e) => {

    window.api.quit();

});

$.fn.GetID = () => {
    var date = new Date();
    var id = date.getTime();

    return id;

}

$.fn.Substitute = (template, values) => {
    let value = template;

    let keys = Object.keys(values);

    for (let key in keys) {
        value = value.split("${" + keys[key] + "}").join(values[keys[key]]);
    }

    return value;

}

$.fn.Load = (zipData) => {
    var zipFile = new zip();
    var structure = {};

    tree.removeTree();

    tree = createTree('placeholder', 'white', ACCOUNTS_MENU, CALLBACKS);

    zipFile.loadAsync(zipData).then(async function(zipFile) {

        var files = zipFile.file(/.*/);
        cards = [];
        var structure = {};
        var node = null;

        zipFile.forEach(async function(relativePath, zipEntry) { // 2) print entries

            if (zipEntry.dir) {
                if (node == null) {
                    node = tree.createNode(zipEntry.name.replace(/.$/, ''), false, 'assets/images/folder-icon.png', null, null, 'context1');
                } else {

                    var paths = relativePath.replace(/.$/, '').split("/");
                    var folder = ""

                    for (var iPath = 0; iPath < paths.length - 1; iPath++) {
                        folder += paths[iPath] + "/";
                    }

                    node = structure[folder].createChildNode(paths[paths.length - 1], false, "assets/images/document-icon.png", null, "context2");

                }

                console.log(`adding relativePath ${relativePath}`)

                structure[relativePath] = node;

            } else {

                function getBlob(file) {

                    return new Promise(resolve => {
                        file.async("blob").then(function(blob) {
                            resolve(blob);
                        });

                    });

                }

                function read_blob(url) {

                    return new Promise(resolve => {
                        var reader = new FileReader();

                        reader.onload = function() {
                            resolve(reader.result);
                        }

                        reader.readAsText(url);

                    });

                }

                var fileUrl = await getBlob(zipEntry);
                var json = await read_blob(fileUrl);

                cards[structure[relativePath.replace("receipts.json", "")].id] = JSON.parse(json);

            }

        });

        tree.drawTree();

    })

}

$.fn.Save = (zipFolder, nodes) => {

    for (let iNode in nodes) {

        let subFolder = zipFolder.folder(nodes[iNode].text);

        if (nodes[iNode].id in cards) {
            let receipts = JSON.stringify(cards[nodes[iNode].id]);
            subFolder.file('receipts.json', JSON.stringify(cards[node.id]));
        }

        $(this).Save(subFolder, nodes[iNode].childNodes)

    }

}

$.fn.Tag = () => {
    let selectedMarkers = markers[tree.selectedNode.id];

    if (selectedMarkers == null) {
        selectedMarkers = [];
    }

    for (let iMarker = 0; iMarker < 5; iMarker++) {

        if (selectedMarkers.indexOf(iMarker) != -1) {
            $(`#bookmark-${iMarker}`).removeClass('fa-circle-o');
            $(`#bookmark-${iMarker}`).addClass('fa-circle');
        } else {
            $(`#bookmark-${iMarker}`).removeClass('fa-circle');
            $(`#bookmark-${iMarker}`).addClass('fa-circle-o');
        }

    }

}

$.fn.Markers = () => {

    for (let iMarker = 0; iMarker < 5; iMarker++) {

        $(`#marker-${iMarker}`).on('click', (e) => {
            $(`#marker-${iMarker}`).toggleClass('fa-circle-o fa-circle');

            if ($(`#marker-${iMarker}`).hasClass('fa-circle')) {

                if (markers[tree.selectedNode.id] == null) {
                    markers[tree.selectedNode.id] = [iMarker];
                } else {
                    if (!markers[tree.selectedNode.id].includes(markers)) {
                        markers[tree.selectedNode.id].push(markers);
                    }
                }

            } else {
                let selectedMarkers = markers[tree.selectedNode.id];

                if (selectedMarkers == null) {
                    selectedMarkers = [];
                }
                let index = selectedMarkers.indexOf(iMarker);

                if (index != -1) {
                    markers[tree.selectedNode.id].splice(index, 1);
                }

            }

        });

    }

}

$.fn.Close = (id) => {
    $(id)[0].parentNode.removeChild($(id)[0]);
}

$.fn.Drag = (event) => {
    event.dataTransfer.setData("card", event.target.id);

}

$.fn.AllowDrop = (event) => {
    event.preventDefault();
}

$.fn.Drop = (event) => {
    event.preventDefault();

    let data = event.dataTransfer.getData("card");

}

$.fn.OnInput = (field, id, value) => {

    cards[tree.selectedNode.id][id][field] = value;

}

$.fn.OnCardDrop = (event) => {}

/**
 * Add another card to the swipper
 * 
 * @param {String} time The current Time
 */
function addSwiperEntry(dayofmonth) {
    var entry = generateSwiperEntry(dayofmonth);

    $('#image-container')[0].insertBefore(entry.node, entry.position);

    return entry;

}

$(async() => {

    tree = createTree('placeholder', 'white', ACCOUNTS_MENU, CALLBACKS);

    let root = tree.createNode('Accounts', false, 'assets/images/folder-icon.png', null, null, 'context1');

    tree.drawTree();

    tree.selectNode(root);

    $('#open').on('click', (e) => {
        var loadButton = document.createElementNS("http://www.w3.org/1999/xhtml", "input");

        loadButton.setAttribute("type", "file");
        loadButton.accept = '.zip';

        loadButton.addEventListener('change', function() {

            var files = $(this)[0].files;

            var reader = new FileReader();

            reader.onload = function() {

                $(this).Load(reader.result);

            };

            reader.readAsArrayBuffer(files[0]);
            return false;

        }, false);

        loadButton.click();

    });

    $('#save').on('click', (e) => {
        let zipFile = new zip();
        let folder = zipFile.folder("");

        $(this).Save(folder, tree.childNodes);

        zipFile.generateAsync({ type: "blob" })
            .then(function(blob) {
                fileSaver.saveAs(blob, "receipts.zip")
            });

    });

    $('#new').on('click', (e) => {});

    $('#print').on('click', (e) => {
        let html = [];

        let footer = format.hasOwnProperty('footer') ? format['footer'] : "";
        text = `<html><style>td { min-width:100px;} ` +
            `.center { display: block; margin-left: auto; margin-right: auto; width: 50%; }` +
            `</style> <div id="footer" class="footer">${footer}</div><div style="font-family:Arial, Helvetica, sans-serif; font-size:14px;">${text}</div><html>`;

        $('#print-area').html(text);
        window.print();

    });

    $('#add-income').on('click', (e) => {
        let template = $('script[data-template="card-item"]').text();
        let id = $(this).GetID();
        let date = new Date();
        let dateFormatter = new DateFormatter('F j, Y', (new Date()).getTime());
        if (cards[tree.selectedNode.id] == undefined) {
            cards[tree.selectedNode.id] = {};
        }

        cards[tree.selectedNode.id][id] = {
            merchant: '',
            date: dateFormatter.formattedDate,
            amount: '$0.00',
            type: 'income'
        };

        let value = $(this).Substitute(template, {
            id: id,
            merchant: cards[tree.selectedNode.id][id].merchant,
            amount: cards[tree.selectedNode.id][id].amount,
            date: cards[tree.selectedNode.id][id].date,
            type: cards[tree.selectedNode.id][id].type,
            icon: 'fa-piggy-bank'
        });

        let fragment = document.createRange().createContextualFragment(value);

        $('#receipt-container')[0].appendChild(fragment);

        picker.decorate(document.getElementById(`date-${id}`));
        picker.addEventListener(updateDate);

        Currency.apply();

        $(this).Markers();

    });

    $('#add-expense').on('click', (e) => {
        let template = $('script[data-template="card-item"]').text();
        let id = $(this).GetID();
        let date = new Date();
        let dateFormatter = new DateFormatter('F j, Y', (new Date()).getTime());
        if (cards[tree.selectedNode.id] == undefined) {
            cards[tree.selectedNode.id] = {};
        }

        cards[tree.selectedNode.id][id] = {
            merchant: '',
            date: dateFormatter.formattedDate,
            amount: '$0.00',
            type: 'expense'
        };

        let value = $(this).Substitute(template, {
            id: id,
            merchant: cards[tree.selectedNode.id][id].merchant,
            amount: cards[tree.selectedNode.id][id].amount,
            date: cards[tree.selectedNode.id][id].date,
            type: cards[tree.selectedNode.id][id].type,
            icon: 'fa-donate'
        });

        let fragment = document.createRange().createContextualFragment(value);

        $('#receipt-container')[0].appendChild(fragment);

        picker.decorate(document.getElementById(`date-${id}`));

        Currency.apply();

        $(this).Markers();

    });

    $('#navigate').on('click', (e) => {

        $('#navigate-box').css('display', 'inline-block');

    });

    $('#format').on('click', (e) => {

        if (format['footer']) {
            $('#footer').val(format['footer']);
        } else {
            $('#footer').val("");
        }

        $('#format-box').css('display', 'inline-block');

    });

    $('#help').on('click', (e) => {

        $('#dialog-help').css('display', 'inline-block');

    });

    $('#close').on('click', (e) => {

        $('#dialog-help').css('display', 'none');

    });

    $('#accept-format').on('click', (e) => {

        format['footer'] = $('#footer').val();
        $('#format-box').css('display', 'none');

    });

    $('#cancel-format').on('click', (e) => {

        $('#format-box').css('display', 'none');

    });

    $('#close-format-box').on('click', (e) => {

        $('#format-box').css('display', 'none');

    });

    let paneSep = $("#separator")[0];

    paneSep.sdrag(function(el, pageX, startX, fix) {
        let leftPaneWidth = $("#separator").offset().left - 56;
        let rightPaneLeft = $("#separator").offset().left + 9;

        $("#container").width(leftPaneWidth + "px");
        $("#views").css("left", rightPaneLeft + "px");

    });

    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => event.preventDefault());

    document.getElementById('calendar-month-year').innerHTML = `${calendar.getMonthLong()}/${calendar.getYear()}`;

    calendar.setup();

    document.getElementById('left-calendar-year').addEventListener('click', e => {
        console.log('left-calendar-year');
        calendar.minusYear();
        document.getElementById('calendar-month-year').innerHTML = `${calendar.getMonthLong()}/${calendar.getYear()}`;
    });

    document.getElementById('right-calendar-year').addEventListener('click', e => {
        console.log('right-calendar-year');
        calendar.addYear();
        document.getElementById('calendar-month-year').innerHTML = `${calendar.getMonthLong()}/${calendar.getYear()}`;
    });

    document.getElementById('left-calendar-month').addEventListener('click', e => {
        console.log('left-calendar-month');
        calendar.minusMonth();
        document.getElementById('calendar-month-year').innerHTML = `${calendar.getMonthLong()}/${calendar.getYear()}`;

    });

    document.getElementById('right-calendar-month').addEventListener('click', e => {
        console.log('right-calendar-month');
        calendar.addMonth();
        document.getElementById('calendar-month-year').innerHTML = `${calendar.getMonthLong()}/${calendar.getYear()}`;
    });

});