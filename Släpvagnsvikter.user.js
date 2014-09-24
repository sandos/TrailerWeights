// ==UserScript==
// @name        Släpvagnsvikter
// @namespace   http://se.sandos
// @include     http://bytbil.com/bilar/*
// @include     http://m.bytbil.com/Sok/Fordon/*
// @include     http://m.bytbil.com/Sok/Resultat
// @include     http://bytbil.com/transportbilar/*
// @include     http://bytbil.com/husvagnar-husbilar/*
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==


function sibling(dom, str) {
  var xp = dom.evaluate("//div[contains(text(), '" + str + "')]", dom, null, XPathResult.FIRST_ORDERED_NODE_TYPE , null);
  return xp;
}

function add(title, value, node) {
  var dt = document.createElement("dt");
  dt.appendChild(document.createTextNode(title));
  node.parentElement.appendChild(dt);
  var dd = document.createElement("dd");
  dd.appendChild(document.createTextNode(value));
  node.parentElement.appendChild(dd);
}

function add2(title, value, node) {
  var dt = document.createElement("p");
  dt.appendChild(document.createTextNode(title));
  node.parentElement.appendChild(dt);
  var dd = document.createElement("p");
  dd.appendChild(document.createTextNode(value));
  node.parentElement.appendChild(dd);
}


function getBilUppgifter(reg, func) {
  GM_xmlhttpRequest ( {
      method:     "GET",
      url:        "http://biluppgifter.se/fordon/" + reg,
      onload:     function (response) {
          var ne = response.responseText.replace("<link href='http://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700' rel='stylesheet' type='text/css'>", "")
          ne = ne.replace('<meta name="description" content="Använd biluppgifter.se för att snabbt och gratis söka registreringsnummer i Transportstyrelsens bilregister">', '');
          ne = ne.replace('alt="bilregistret fordonsregister"', '');
          ne = ne.replace('<!--', '');
          ne = ne.replace('<img width="1" height="1" alt="" src="http://logc406.xiti.com/hit.xiti?s=551627&s2=&p=&di=&an=&ac=" >', '');
          responseXML = new DOMParser().parseFromString(ne, "text/html");
          func(responseXML);
      }
    });
}

console.log('tjo');

try {
  var cells = document.querySelectorAll("div.col-sm-6:nth-child(1) > div:nth-child(1) > div:nth-child(1) > dl:nth-child(1) > dd:nth-child(8)")
  console.log(cells);
  for (var i = 0; i < cells.length; ++i) {
    var item = cells[i];
    console.log(item.textContent);
    
    GM_xmlhttpRequest ( {
      method:     "GET",
      url:        "http://biluppgifter.se/fordon/" + item.textContent,
      onload:     function (response) {
          var ne = response.responseText.replace("<link href='http://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700' rel='stylesheet' type='text/css'>", "")
          ne = ne.replace('<meta name="description" content="Använd biluppgifter.se för att snabbt och gratis söka registreringsnummer i Transportstyrelsens bilregister">', '');
          ne = ne.replace('alt="bilregistret fordonsregister"', '');
          ne = ne.replace('<!--', '');
          ne = ne.replace('<img width="1" height="1" alt="" src="http://logc406.xiti.com/hit.xiti?s=551627&s2=&p=&di=&an=&ac=" >', '');
          responseXML = new DOMParser().parseFromString(ne, "text/html");
          try {
            console.log("xpath");
            var xp = sibling(responseXML, "Släpvagnsvikt");
            if(xp != null) {
              var max = xp.singleNodeValue.nextElementSibling.textContent;
              add("Släpvagnsvikt", max, item);
            } 
            xp = sibling(responseXML, "Släp totalvikt (B)");
            if(xp != null) {
              var max = xp.singleNodeValue.nextElementSibling.textContent;
              add("Tot. vikt B", max, item);
            } 
            xp = sibling(responseXML, "Släp totalvikt (B+)");
            if(xp != null) {
              var max = xp.singleNodeValue.nextElementSibling.textContent;
              add("Tot. vikt B96", max, item);
            } 

          } catch(err) {
            console.log("Error in callback " + err);
          }
      }
    });
  }
  var rows = document.querySelectorAll("div.row > a:nth-child(1)");
  console.log(rows);
  
  for(var i = 0; i < rows.length; ++i) {
    let rr = rows[i];
    console.log(rr);
    
    GM_xmlhttpRequest ( {
      method:     "GET",
      url:        rr.href,
      onload:     function (response) {
          dd = new DOMParser().parseFromString(response.responseText, "text/html");
          try {
            var cells = dd.querySelectorAll("div.col-sm-6:nth-child(1) > div:nth-child(1) > div:nth-child(1) > dl:nth-child(1) > dd:nth-child(8)");
            console.log(cells[0].textContent);
            
            var dom = getBilUppgifter(cells[0].textContent, function (dom) {
              var xp = sibling(dom, "Släpvagnsvikt");
              if(xp != null) {
                var max = xp.singleNodeValue.nextElementSibling.textContent;
                console.log(max + " " + cells[0].textContent + " " + rr.href);
                var divs = rr.querySelectorAll("div.objectdesc > p:nth-child(1)");
                console.log(divs[0]);
                add2("Släpvikt", max, divs[0]);
              } 
            });
            
            
          } catch(err) {
            console.log("Error in callback2 " + err);
          }
      }
    });
  }
} catch (err) {
  console.log("Error " + err);
}

