"use strict";

var socket = new WebSocket(WEB_SOCKET_URL);

var EditableUserTable = function(id, columns, request) {
    /* Elements */
    this.state = {
        id,
        columns,
        request,
        process: 0,       // flag that shows current status [0: free, 1: adding, 2: editing]
        prevRow: '',
    };

    /* Functions */
    this.isTableEmpty = function() {
        if ($(id + ' tbody tr').length == 0 || (
            $(id + ' tbody tr').length == 1 &&
            $(id + ' tbody tr').eq(0).find('td').length == 1)) {
                return true;
        }
        return false;
    }
    // To toggle drowdown menu
    this.toggleDropdownMenu = function($tr) {
        $tr.find('.action-dropdown-menu').toggleClass('hidden');
    }
    // To close drowdown menu
    this.closeDropdownMenu = function($tr) {
        $tr.find('.action-dropdown-menu').addClass('hidden');
    }
    // To change dropdown menu for editing
    this.changeDropdownMenuForEditing = function($tr) {
        // Change edit button to save button
        const $editBtn = $tr.find('button[data-role=edit]');
        $editBtn.attr('data-role', 'save');
        $editBtn.text('Save');
        // Add cancel button to the end of dropdown menu
        const $cancelBtn = `<button type="button" class="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-primary-lighter hover:text-white" role="menuitem" tabindex="-1" data-role="cancel">Cancel</button>`;
        $tr.find('.action-dropdown-menu div').append($cancelBtn);
    }
    // To change dropdown menu for displaying
    this.changeDropdownMenuForDisplaying = function($tr) {
        const { process } = this.state;
        if (process < 2) return;
        // Change edit button to save button
        const $saveBtn = $tr.find('button[data-role=save]');
        $saveBtn.attr('data-role', 'edit');
        $saveBtn.text('Edit');
        // Remove cancel button to the end of dropdown menu
        $tr.find('button[data-role=cancel]').remove();
    }
    // To change current row state for editing
    this.changeRowForEditing = function($tr) {
        const { columns, process } = this.state;
        this.state.prevRow = $tr.html();
        let index = 0;
        for (const key in columns) {
            if (columns.hasOwnProperty(key)) {
                const column = columns[key];
                if (column.editable === true) {
                    const $td = $tr.find('td').eq(index);
                    if (column.type === 'select') {
                        const text = $td.text();
                        const select = `<select class="h-[32px] max-w-[120px] border border-solid border-gray-300 rounded"></select>`;
                        $td.html(select);
                        const $select = $td.find('select');
                        let options = '';
                        if (key === 'priority') {
                            options += `<option value="${text}">${text}</option>`;
                        } else if (key === 'bot_id') {
                            options += `<option value="0"></option>`;
                        }
                        // const emailExists = botList.some(bot => bot.email === text);
                        // if (!emailExists) {
                            //     options = `<option value="0"></option>`;
                            // }
                        const list = selectData[key];
                        list.map(item => {
                            let optionValue = '', optionText = ''; 
                            if (key === 'priority') {
                                optionValue = item;
                                optionText = item;
                            } else if (key === 'bot_id') {
                                optionValue = item.id;
                                optionText = item.email;
                            }
                            options += `<option value="${optionValue}"${optionText === text ? ' selected': ''}>${optionText}</option>`;
                        });
                        $select.html(options);
                    } else {
                        const input = `<input type="${column.type}" class="h-[32px] max-w-[120px] border border-solid border-gray-300 rounded text-center" value="${$td.text()}">`;
                        $td.html(input);
                    }
                }
            }
            index ++;
        }
    }
    // To change current row state to normal
    this.changeRowForDisplaying = function($tr) {
        const { process, prevRow } = this.state;
        // Remove row when being added
        if (process === 1) {
            $tr.remove();
            return;
        }
        // Return to prev row data
        $tr.html(prevRow);
    }
    this.initHandlers = function() {
        const self = this;
        const { id, request } = this.state;
        // To click action button to open dorpdown menu
        $(id + ' tbody').on('click', 'button[data-role=action_dropdown]', function() {
            const $tr = $(this).closest('tr');
            self.toggleDropdownMenu($tr);
        });
          // To click edit button to edit current row data
        $(id + ' tbody').on('click', 'button[data-role=edit]', function() {
            const { process } = self.state;
            if (process > 0) return;
            const $tr = $(this).closest('tr');
            self.changeRowForEditing($tr);
            self.changeDropdownMenuForEditing($tr);
            // Set process flag 2
            self.state.process = 2;
        });
        // To click add button to add new row data
        $(id).siblings('button[data-role=add]').on('click', function() {
            const { process } = self.state;
            if (process > 0) return;
            let $row = `<tr class="border border-solid border-gray-300">`;
            let index = 0;
            // Create input fields and set default text
            for (const key in columns) {
                if (columns.hasOwnProperty(key)) {
                    $row += `<td class="py-[12px] px-[40px]">`;
                    const column = columns[key];
                    if(column.editable === true) {
                        if (column.type === 'select') {
                            let select = `<select class="h-[32px] max-w-[120px] border border-solid border-gray-300 rounded">`;
                            if(key === 'priority') {
                                select += `<option value=""></option>`;
                            } else if(key === 'bot_id') {
                                select += `<option value="0"></option>`;
                            }
                            const list = selectData[key];
                            console.log(list);
                            list.map(item => {
                                let optionValue = '', optionText = '';
                                if (key === 'priority') {
                                    optionValue = item;
                                    optionText = item;
                                } else if (key === 'bot_id') {
                                    optionValue = item.id;
                                    optionText = item.email;
                                }
                                select += `<option value="${optionValue}">${optionText}</option>`;
                            });
                            select += `</select>`;
                            $row += select;
                        } else {
                            const input = `<input type="${column.type}" class="h-[32px] max-w-[120px] border border-solid border-gray-300 rounded text-center">`;
                            $row += input;
                        }
                    } else {
                        if (key === 'created_by') {
                            $row += userName;
                        }
                    }
                    $row += `</td>`;
                }
                index ++;
            }
            // Dom element for dropdown menu
            $row += `<td class="py-[12px] px-[40px]"6>
                <div class="relative inline-block text-left">
                    <div>
                        <button type="button" class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-bg-primary-light px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 duration-300 hover:bg-primary-lighter hover:text-white" data-role="action_dropdown">
                            Action
                            <svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div class="action-dropdown-menu absolute hidden right-0 z-10 mt-2 w-[100px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu">
                        <div class="py-1">
                            <button type="button" class="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-primary-lighter hover:text-white" role="menuitem" tabindex="-1" data-id="-1" data-role="save">Save</button>
                            <button type="button" class="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-primary-lighter hover:text-white" role="menuitem" tabindex="-1" data-id="-1" data-role="cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            </td></tr>`;
            // Add dom
            if (self.isTableEmpty()) {
                $(id + ' tbody').html($row);
            } else {
                $(id + ' tbody').append($row);
            }
            // Set process flag 1
            self.state.process = 1;
        });
        // To click save button to save current row data
        $(id + ' tbody').on('click', 'button[data-role=save]', function() {
            const { columns } = self.state;
            const $tr = $(this).closest('tr');
            const row_id = Number.parseInt($(this).attr('data-id'));
            let data = {};
            let index = 0;
            // Make request data (dynamic)
            for (const key in columns) {
                if (columns.hasOwnProperty(key)) {
                    const column = columns[key];
                    if(column.editable === true) {
                        const $td = $tr.find('td').eq(index);
                        const value = (column.type === 'select' ? $td.find('select').val() : $td.find('input').val());
                        console.log(column.type);
                        if (value.length === 0) {
                            toastr.warning('All input fields are required.', 'Warning!');
                            return;
                        }
                        data[key] = value;
                    }
                }
                index ++;
            }
            console.log(data);
            // Add new
            if (row_id < 0) {
                if (confirm('Do you really want to add this row?')) {
                    // Send request
                    $.post(
                        request.url, 
                        {
                            action: request.actions.add,
                            data
                        },
                        function(res) {
                            console.log(res);
                            switch (res) {
                                case 'success':
                                    window.location.reload();
                                    break;
                                case 'exist':
                                    toastr.warning('Same data row already exist.', 'Warning!');
                                    break;
                                default:
                                    toastr.warning('Please try again after reload this page.', 'Warning!');
                                    break;
                            }
                        }
                    );
                }
            }
            // Update
            else {
                if (confirm('Do you really want to update this row?')) {
                    data.row_id = row_id;
                    // Send request
                    $.post(
                        request.url, 
                        {
                            action: request.actions.update,
                            data
                        },
                        function(res) {
                            console.log(res);
                            switch (res) {
                                case 'success':
                                    window.location.reload();
                                    break;
                                case 'not_exist':
                                    toastr.warning('This data row does not exist.', 'Warning!');
                                    break;
                                default:
                                    toastr.warning('Please try again after reload this page.', 'Warning!');
                                    break;
                            }
                        }
                    );
                }
            }
        });
        // To click delete button to delete current row
        $(id + ' tbody').on('click', 'button[data-role=delete]', function() {
            if (confirm('Do you really want to delete this row?')) {
                const row_id = Number.parseInt($(this).attr('data-id'));
                const data = { row_id };
                // Send request
                $.post(
                    request.url, 
                    {
                        action: request.actions.delete,
                        data
                    },
                    function(res) {
                        console.log(res);
                        switch (res) {
                            case 'success':
                                window.location.reload();
                                break;
                            case 'not_exist':
                                toastr.warning('This data row does not exist.', 'Warning!');
                                break;
                            default:
                                toastr.warning('Please try again after reload this page.', 'Warning!');
                                break;
                        }
                    }
                );
            }
        });
        // To click cancel button to cancel editing
        $(id + ' tbody').on('click', 'button[data-role=cancel]', function() {
            const $tr = $(this).closest('tr');
            self.changeRowForDisplaying($tr);
            self.changeDropdownMenuForDisplaying($tr);
            self.closeDropdownMenu($tr);
            // Set process flag 0
            self.state.process = 0;
        });
        
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // To click action button to open dorpdown menu
        $(id + ' tbody').on('click', 'button[data-role=priority_dropdown]', function() {
            const $tr = $(this).closest('tr');
            $tr.find('.priority-dropdown-menu').toggleClass('hidden');
        });
        // To click number button to change priority
        $(id + ' tbody').on('click', '.priority-dropdown-menu button', function() {
            const $tr = $(this).closest('tr');
            const $dropdownBtn = $tr.find('button[data-role=priority_dropdown]');
            const content = `${$(this).attr('data-value')}<svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"></path></svg>`
            $dropdownBtn.html(content);
            const $input = $tr.find('input.priority');
            $input.val($(this).attr('data-value'));
            console.log($input.val());
            const $dropdownMenu = $tr.find('.priority-dropdown-menu');
            $dropdownMenu.toggleClass('hidden');
        });
    }

    this.init = function() {
        this.initHandlers();
    }
}

// Class definition
var HomeModule = (function() {
    // Handles & Functions
    var initHandlers = function() {
        $('#run-bot').on('click', function(e) {
            /*
            // Run .exe to start running bot
            $.get('bot-ctrl/run-bot.php', function(res) {
                console.log(res);
            });
            setTimeout(function() {
                window.location.href = 'logs.php';
            }, 2000);
            */
           socket.send('admin-call-bot');
        });
    };

    //
    var getAllUsersData = function() {
        $.get(BASE_URL + 'controller/homeController.php?action=get-all-users', function(res) {
            $('#tbl-users tbody').html(res);
        });
    }

    // 
    var getAllBotsData = function() {
        $.get(BASE_URL + 'controller/homeController.php?action=get-all-bots', function(res) {
            $('#tbl-bots tbody').html(res);
        });
    };

    // Initialization
    var init = function() {
        initHandlers();
        // Showing table data
        getAllUsersData();
        getAllBotsData();
    };

    // Return elements and functions which can be called outside of the class
    return {
        init: init,
    }
})();

// const transmitMessage = function() {
//     socket.send( message.value );
// }

$(document).ready(function() {
    HomeModule.init();
    // User's table data
    const userColumns = {
        no: {
            type: 'number',
            editable: false
        },
        firstname: {
            type: 'text',
            editable: true,
        },
        lastname: {
            type: 'text',
            editable: true,
        },
        passport: {
            type: 'text',
            editable: true,
        },
        latest_day: {
            type: 'date',
            editable: true,
        },
        current_appointment_day: {
            type: 'date',
            editable: true,
        },
        priority: {
            type: 'select',
            editable: true,
        },
        bot_id: {
            type: 'select',
            editable: true,
        },
        status: {
            type: 'checkbox',
            editable: false,
        },
        created_by: {
            type: 'text',
            editable: false,
        }
    };
    const userRequest = {
        url: BASE_URL + 'controller/homeController.php',
        actions: {
            add: 'add-new-user',
            update: 'update-user',
            delete: 'delete-user',
            update_user_status: 'update-user-status',
        }
    };
    // Create editable table for user management
    EditableUserTable.prototype.customEventHandlers = function() {
        const { id, request } = this.state;
        $(id + ' tbody').on('change', '.switch input[type=checkbox]', function() {
            const status = $(this).is(':checked');
            const row_id = Number.parseInt($(this).attr('data-id'));
            const data = { row_id, status };
            // Send request to change status state
            $.post(
                request.url,
                {
                    action: request.actions.update_user_status, 
                    data
                },
                function(res) {
                    console.log(res);
                    switch (res) {
                        case 'success':
                            toastr.success('User status has changed.', 'Success!');
                            break;
                        case 'not_exist':
                            toastr.warning('This data row does not exist.', 'Warning!');
                            break;
                        default:
                            toastr.warning('Please try again after reload this page.', 'Warning!');
                            break;
                    }
                }
            );
        });
    };
    // Create editable table for user management
    const userTable = new EditableUserTable('#tbl-users', userColumns, userRequest);
    userTable.init();
    userTable.customEventHandlers();

    // Bot's table data
    const botColumns = {
        no: {
            type: 'number',
            editable: false,
        },
        email: {
            type: 'email',
            editable: true,
        },
        password: {
            type: 'text',
            editable: true,
        }
    }
    const botRequest = {
        url: BASE_URL + 'controller/homeController.php',
        actions: {
            add: 'add-new-bot',
            update: 'update-bot',
            delete: 'delete-bot'
        }
    };
    // Create editable table for user management
    const botTable = new EditableTable('#tbl-bots', botColumns, botRequest);
    botTable.init();

    socket.onopen = () => {
        console.log("WebSocket connection established.");
        // Now you can safely send data
    };
    // Socket listener
    socket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data.to === 'browser') {
            if(data.status === 'success') {
                window.location.href = 'logs.php';
            } 
	// else {
        //        toastr.warning('Please try again after reload this page.', 'Warning!');
        //    }
        }
    };
});