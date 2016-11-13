$(document).ready(function() {
    //全局变量
    var socket = io();
    var userName = localStorage.getItem('name');
    var from = userName;
    var to = 'all';

    function renderColor(data) {
        var num = $('#messages').children('div').length;
        if (num % 2 == 0) {
            return "<div class='panel-body'>" + renderFrom(data.from) + "对" + renderTo(data.to) + replace_em(data.msg) + "</div>";
        } else {
            return "<div class='panel-footer'>" + renderFrom(data.from) + "对" + renderTo(data.to) + replace_em(data.msg) + "</div>";
        }
    }

    function renderFrom(from) {
        return "<span class='from'>" + from + "&nbsp;&nbsp;" + "</span>"
    }

    function renderTo(to) {
        return "<span class='to'>" + "&nbsp;&nbsp;" + to + "&nbsp;&nbsp;</span>说:"
    }

    function login() {
        var name = $("#user").val();
        if (localStorage.getItem('name')) {
            return;
        }
        $.ajax({
                method: "GET",
                url: "/login",
                data: {
                    name: name
                }
            })
            .done(function(msg) {
                localStorage.setItem('name', name);
            })
            .fail(function() {
                alert("登录失败!");
            });
        $('#myModal').modal('hide')
    }

    function flushUsers(users) {
        $("#userlist").empty().append("<div class='list-group-item active' data-user='all'>所有人</div>");
        for (var i in users) {
            $("#userlist").append("<div class='list-group-item' data-user='" + users[i] + "'>" + users[i] + "</div>");
        }
        $('#userlist > div').dblclick(function() {
            $('#userlist > div').removeClass('active');
            $(this).addClass('active')
        });
    }

    if (!localStorage.getItem('name')) {
        $('#myModal').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#login').bind('click', function() {
            login();
        });

    }
    $('#emotion').qqFace({
        assign: 'msg', //给输入框赋值
        path: '/images/face/' //表情图片存放的路径
    });
    // $(".sub_btn").click(function() {
    //     var str = $("#saytext").val();
    //     $("#messages").append(replace_em(str));
    // });

    function replace_em(str) {
        str = str.replace(/\</g, '&lt;');
        str = str.replace(/\>/g, '&gt;');
        str = str.replace(/\n/g, '<br/>');
        str = str.replace(/\[em_([0-9]*)\]/g, '<img src="images/face/$1.gif" border="0" />');
        return str;
    }

    $('form').submit(function() {
        var toDiv = ($('#userlist').find('div.active')[0]);
        var to = $(toDiv).attr('data-user');
        if (to == 'all') {
            socket.emit('chat message', {
                msg: $('#msg').val(),
                from: userName,
                to: '所有人'
            });
        } else {
            socket.emit('chat secret', {
                msg: $('#msg').val(),
                from: userName,
                to: to
            });
        }
        $('#msg').val('');
        return false;
    });

    socket.emit('online', {
        user: userName
    });
    socket.on('online', function(data) {
        flushUsers(data.users);
    });
    socket.on('chat message', function(data) {
        var msgdiv = renderColor(data);
        $('#messages').append(msgdiv);
    });
    socket.on('chat secret', function(data) {
        var msgdiv = renderColor(data);
        $('#messages').append(msgdiv);
    });
    socket.on('disconnect', function() {

    });
});
