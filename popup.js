window.callback = function(doc) {
    doc.getElementById('the-field').value = "Hello there";
    doc.getElementById('div-content').innerHTML = "Hello world";
}

window.onload = function() {
	var url = chrome.extension.getBackgroundPage().myURL;
	var xhr = new XMLHttpRequest();
	var seen = {};
	xhr.open("GET", "http://access.alchemyapi.com/calls/url/URLGetRankedKeywords?url=" + url + "&apikey=249fac5a9744d90703c559ab250f07e7d5fbca8b&outputMode=json&maxRetrieve=10", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var popup_title = document.getElementById("popup-title");
			popup_title.innerHTML = "Wikid";
			var list = document.getElementById("link-list");
		    // JSON.parse does not evaluate the attacker's scripts.
		    var alchemy_resp = JSON.parse(xhr.responseText);
		    var keywords = alchemy_resp.keywords;
	    	var xhr_inner = new XMLHttpRequest();
		    var wiki_url = "http://en.wikipedia.org/w/api.php?action=query&format=json&titles=" + encodeURI(keywords[0].text) + "&prop=revisions&rvprop=content";
			console.log(wiki_url);
			xhr_inner.open("GET", wiki_url, true);
			xhr_inner.onreadystatechange = function() {
				if (xhr_inner.readyState == 4) {
				    // JSON.parse does not evaluate the attacker's scripts.
				    var wiki_resp = JSON.parse(xhr_inner.responseText);
				    console.log(wiki_resp);
				    for (var key in wiki_resp.query.pages) {
				    	console.log("hmm");
				    	var page_id = wiki_resp.query.pages[key].pageid;
				    	var page_title = wiki_resp.query.pages[key].title;
				    	if (seen[page_id] === undefined) {
				    		var page_link = document.createElement("li");
					    	page_link.innerHTML = "<a href='http://en.wikipedia.org/wiki?curid=" + page_id + "'>" + page_title + "</a>"
					    	list.appendChild(page_link);
					    	seen[page_id] = true;
				    	}
					}
				}
			}
			xhr_inner.send();
	    }
	}
	xhr.send();
	document.onclick = function(e) {
		console.log(e.toElement.localName);
		if (e.toElement.localName === "a") {
			// Clicked a link
			chrome.tabs.create({url: e.toElement.href});
     		return false;
		}
	}
}