$(document).ready(function() {
    //全局变量
    var socket = io();
    var userName = localStorage.getItem('name');
    var from = userName;
    var to = 'all';

    function renderColor(data) {
        var num = $('#messages').children('div').length;
        if (num % 2 == 0) {
            return "<div class='panel-body'>" + renderFrom(data.from) + "对" + renderTo(data.to) + replace_em(data.msg) + "<span class='time'>"+getTime()+"</span></div>";
        } else {
            return "<div class='panel-footer'>" + renderFrom(data.from) + "对" + renderTo(data.to) + replace_em(data.msg) + "<span class='time'>"+getTime()+"</span></div>";
        }
    }

    function renderFrom(from) {
        return "<span class='from'>" + from + "&nbsp;&nbsp;" + "</span>"
    }

    function renderTo(to) {
        return "<span class='to'>" + "&nbsp;&nbsp;" + to + "&nbsp;&nbsp;</span>说:&nbsp;&nbsp;&nbsp;&nbsp;"
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
                $("#usernick").html(name);
                //刷新页面解决用户刷新问题
                window.location.reload(); 
            })
            .fail(function() {
                alert("登录失败!");
            });
        $('#myModal').modal('hide')
    }

    function flushUsers(users) {
        $("#usernick").html(userName);
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

    function replace_em(str) {
        str = str.replace(/\</g, '&lt;');
        str = str.replace(/\>/g, '&gt;');
        str = str.replace(/\n/g, '<br/>');
        str = str.replace(/\[em_([0-9]*)\]/g, '<img src="images/face/$1.gif" border="0" />');
        return str;
    }
    //定位到最新的消息
    function gotoNewMsg(){
        var num = $('#messages').children('div').length;
        if(num<11){
            return;
        }
        var hight = getScrollHight(num);
        $('#messages').scrollTop(hight);
    }
    function getScrollHight(num){
        var hight = 450; 
        if(num%2==0){
            return hight+(num-10)*45;
        }else{
            return hight+(num-10-1)*45+40;
        }
    }
    function getTime() {
       var date = new Date();
       var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
       return time;
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
        gotoNewMsg();
    });
    socket.on('chat secret', function(data) {
        var msgdiv = renderColor(data);
        $('#messages').append(msgdiv);
        gotoNewMsg();
    });
    socket.emit('disconnect',{user: userName});
    socket.on('disconnect', function(data) {
        flushUsers(data.users);
    });
});
