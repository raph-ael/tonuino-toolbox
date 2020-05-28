let dropdowns = {

    $buttons: null,
    $dropdowns: null,

    init: () => {

        dropdowns.$buttons = $('.btn-dropdown');
        dropdowns.$dropdowns = $('.dropdown-content');

        dropdowns.$dropdowns.find('li').click((ev) => {

            let $dropdown = $(ev.currentTarget).parent().parent().parent();
            $dropdown.hide();

        });

        dropdowns.$buttons.click((ev) => {

            console.log('select clicked');
            let $btn = $(ev.currentTarget);
            let $dropdown = $btn.next('.dropdown-content');

            if($dropdown.is(':visible')) {
                $dropdown.hide();
            }
            else {
                $dropdown.show();
            }
        });

        dropdowns.$buttons.each((i, button) => {

            let $button = $(button);

            let $dropdown = $button.next('.dropdown-content');

            $(document).mouseup((e) => {

                if(
                    $dropdown.is(':visible') &&
                    ( !$dropdown.is(e.target) && $dropdown.has(e.target).length === 0 ) &&
                    ( !$button.is(e.target) && $button.has(e.target).length === 0 )
                ) {
                    $dropdown.hide();
                }
            });
        });
    }

};

module.exports = dropdowns;