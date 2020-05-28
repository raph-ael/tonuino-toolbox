let device_select = {

    $select: null,
    $dropdown: null,
    $list: null,
    $value: null,
    $devices_refresh: null,
    $devices_refresh_icon: null,

    init: (callback) => {

        device_select.$select = $('#device-select');
        device_select.$dropdown = $('#device-dropdown');
        device_select.$list = device_select.$dropdown.find('.list-group');
        device_select.$value = device_select.$select.find('.display-value');
        device_select.$devices_refresh = $('#devices-refresh');
        device_select.$devices_refresh_icon = device_select.$devices_refresh.find('.icon');

        device_select.initEvents();
        device_select.initDevices({
            autoselect: true,
            callback: callback
        });

    },

    reload: () => {
        device_select.initDevices();
    },

    initDevices: (options) => {

        options = $.extend({},{
            autoselect: false,
            callback: null
        }, options);

        device_select.$list.empty();

        device_select.$devices_refresh_icon.addClass('fa-spin');

        worker_api.command('list_devices', {
            success: async (devices) => {

                await helper.asyncForEach(devices, async (device) => {

                    let $li = $(`
                        <li class="list-group-item">
                          <span class="icon icon-drive icon-text"></span> ` + device.name + ` <strong>` + device.size_format + `</strong>
                        </li>
                    `);

                    /*
                     * wenn <= 32GB gehen wir von einer SD-Karte aus
                     */
                    if(device.size < 35433480192) {
                        $li.addClass('maybe-tonuino-drive');
                    }

                    $li.click((ev) => {
                        device_select.$dropdown.hide();
                        device_select.setDevice(device);

                        theapp.setDevice(device);
                        theapp.setFolder(null);
                        theapp.reload();
                    });

                    device_select.$list.append($li);
                });

                /*
                 * wähle ausomatisch erste gefundene tonuino karte
                 */
                let $li_tonuino = device_select.$list.find('.maybe-tonuino-drive');
                if(options.autoselect && $li_tonuino.length > 0) {
                    $li_tonuino.first().trigger('click');
                }
                if(options.callback) {
                    options.callback(devices);
                }

                /*
                 * mini lade animation stoppen
                 */
                setTimeout(() => {
                    device_select.$devices_refresh_icon.removeClass('fa-spin');
                }, 800);
            }
        });

    },

    setDevice: (device) => {
        device_select.$value.text(device.name);
    },

    initEvents: () => {

        device_select.$devices_refresh.click(() => {
            device_select.initDevices();
        });


    }

};

module.exports = device_select;