// google mapの初期位置
var defaultPostion = {lat: 36.090707, lng: 140.098846}
var now_index = 0;
var marker_array = [];
var disasters;
var disaster_index = 0;
var project_token = '';
var google_map_api_key = '';

//projectトークンを設定する
function initToken(token, api_key) {
  project_token = token;
  google_map_api_key = api_key;
}

// ページの初期化関数
// 座標の取得
// selectboxの初期化
// googlemapの初期化
function initMap() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			function(position) {
				console.log(position);
				latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
        // 地図の作成
        var map = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            zoom: 18
				});

				var my_marker = new google.maps.Marker({
					position: latLng,
					map: map,
				});
				
				map.addListener('click', function(e) {
					// console.log(e);
					getClickLatLng(e.latLng, map);
				});
			},
			function(error) {
				console.log(error);
			}
		);
	} else {
		alert('GPSを利用できません');
	}

	if ( ! map) {
		var map = new google.maps.Map(document.getElementById('map'), {
			center: defaultPostion,
			zoom: 14
		});
	
		map.addListener('click', function(e) {
			// console.log(e);
			getClickLatLng(e.latLng, map);
		});
	}
}

// マーカーの設置とフォームの作成
function getClickLatLng(lat_lng, map) {

	if(marker_array[now_index]) {
		marker_array[now_index].setMap(null);
	}

	// 送信する座標をセット
	document.getElementById('latitude').value = lat_lng.lat();
	document.getElementById('longitude').value = lat_lng.lng();

	// マーカーを設置
	var marker = new google.maps.Marker({
	  position: lat_lng,
		map: map,
  });
  marker_array[now_index] = marker;

  // 住所を取得する
  var adress = 'default';
  $.ajax({
		url:`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat_lng.lat()},${lat_lng.lng()}&key=AIzaSyC0AFw2GoFMaCGYX1COZ7BZL04fAKONrvM`,
		type:'get',
	}).done((data) => {
		var text = 'error';
		result = data['results'];
		if(result.length > 0)
		{
			adress = result[0]["formatted_address"];
    }
    markerInfo(marker, adress);
		//document.getElementById('address').innerHTML = `<p>住所 : ${adress}</p>`;
    console.log('success');
	}).fail((data) => {
		console.log('fail');
		console.log(data);
	});

	// 座標の中心をずらす
	// http://syncer.jp/google-maps-javascript-api-matome/map/method/panTo/
	// map.panTo(lat_lng);
}

// マーカーに情報ウインドウを表示する
function markerInfo(marker, adress) {
  var content = `<p style="font-size: 2vh;">${adress}</p>`
  new google.maps.InfoWindow({
      content: content
  }).open(marker.getMap(), marker);
}

// 横のアイコンをタッチするとマーカーの種類が変わる
function change_marker(_id) {
  // 選択されているものの背景色をリセット
  $("#disaster_table tr").each(function(index , elm){
    $(elm).removeClass('table-info');
  });
  disaster_index = _id;
  document.getElementById(`disaster_table_${disaster_index}`).classList.add('table-info');
  document.getElementById('disaster_id').value = disasters[disaster_index]['id'];
  if (marker_array[now_index]) marker_array[now_index].setIcon(disasters[disaster_index]['image']['url']);
}

// モーダルを消す関数

// ajaxでフォームを送る
function send_position() {
  var fd = new FormData($('#positionform').get(0));
  fd.append('project_token', project_token);
  console.log(fd);
  $.ajax({
    type: "POST",
    url: location.protocol + "/position/create/",
    dataType: 'json',
    data: fd,
    processData: false,
    contentType: false,
  }).done(function(data){
    console.log(data);
    if (data['error'])
    {
      document.getElementById('error-modal-body').innerHTML = '';
      data['message']['error'].forEach(element => {
        document.getElementById('error-modal-body').innerHTML += `<p>${element}</p>`;
      });
      $('#error_modal').modal();
    } else {
      document.getElementById('latitude').value = '';
      document.getElementById('longitude').value = '';
      document.getElementById('image').value = '';
      $('#success_modal').modal();
      now_index++;
    }
  }).fail(function(jqXHR, textStatus, errorThrown){
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
  })
}

// セレクトボックスの値が変わったときにアイコンを変更する
$("#disaster_id").change(function() {
	if (marker_array[now_index]) {
		var select_disaster_id = $("#disaster_id").val() - 1;
		marker_array[now_index].setIcon(disasters[select_disaster_id]['image']['url']);
	}
})