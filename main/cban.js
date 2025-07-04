
// Walter Xie
// May 2018

// Package obj
function Package(name, version, downloadURL, projectURL, description, depends){
  this.name = name;
  this.version = version;
  this.downloadURL = downloadURL; // url
  this.projectURL = projectURL;
  this.description = description;
  this.depends = depends;
  
  // methods
  this.fullName = function(){
    return this.name + ":" + this.version;
  } 
  this.dependency = function(){
    var depStr = "";
	for(var i = 0; i < depends.length; i++) {
	  if (i > 0) {
		  depStr = depStr + ", ";
	  }
	  depStr = depStr + depends[i].getAttribute("on") + " (" + depends[i].getAttribute("atleast");
	  if (depends[i].hasAttribute("atmost")) {       
		  depStr = depStr + "-" + depends[i].getAttribute("atmost") + ")";
	  } else {
		  depStr = depStr + "-?)";
	  }
	}
	return depStr;
  } 
} 

// parse packages XML from CBAN
function getPackagesFromXML(xml) {
	var packagesDict = {};
    
    var conn = new XMLHttpRequest();
	conn.open("GET", xml, false);
	conn.onreadystatechange = function () {
	  if (conn.readyState == 4 && conn.status == 200) {
		var doc = conn.responseXML;
		var i, pkgs = doc.getElementsByTagName("package");
		for (i = 0; i < pkgs.length; i++) { 
// 			var name = pkgs[i].getAttribute("name");
// 			var version = pkgs[i].getAttribute("version");
// 			var projectURL = pkgs[i].getAttribute("projectURL");
// 			var description = pkgs[i].getAttribute("description");
// 			var depends = pkgs[i].getElementsByTagName("depends");
			// package Obj
			var pkg = new Package(pkgs[i].getAttribute("name"), pkgs[i].getAttribute("version"),
				pkgs[i].getAttribute("url"),pkgs[i].getAttribute("projectURL"),
				pkgs[i].getAttribute("description"),pkgs[i].getElementsByTagName("depends"));
						
			// Write the data to dict
			var fullName = pkg.fullName().toLowerCase(); // case-insensitive
			packagesDict[fullName] = pkg;

		}
// 		console.log(packagesDict);
	  } else if (xmlhttp.status==404) { 
		alert(xml.concat(" could not be found")); 
	  }
	};
	conn.send(null);
	return packagesDict;
}

function getLatestVersionPackages(packagesDict) {
    const uniqPackagesDict = {};    
	for (const [key, pkgObj] of Object.entries(packagesDict)) {
		var name = pkgObj.name.toLowerCase(); // case-insensitive
		if (name in uniqPackagesDict) {
		    var preObj = uniqPackagesDict[name];
		    if (compareVersions(preObj.version, pkgObj.version) >= 0) {continue;}				
		} 
		uniqPackagesDict[name] = pkgObj;
	}
	return uniqPackagesDict;
}

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
        const num1 = parts1[i] || 0;
        const num2 = parts2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0; // equal
}

// sort by name, but keep BEAST at the first 
function sortPackages(packagesDict) {
	const ordered = {};
	// keep BEAST at the first
	for (const [key, pkgObj] of Object.entries(packagesDict)) {
	    var name = pkgObj.name.toLowerCase(); // case-insensitive
	    if (name == "beast") {
		   ordered[key] = pkgObj;
		   break;
		}
	}
	Object.keys(packagesDict).sort().forEach(function(key) {
	   var name = packagesDict[key].name.toLowerCase(); // case-insensitive
	   if (name != "beast") 
		   ordered[key] = packagesDict[key];
	});
	return ordered;
}

// print packages to html
function printTable(divname) {
	var xml = document.getElementById("xml").value;
	var latest = document.getElementById("latest").checked;
    // a dict, key is name:version, value is a Package obj
    var packagesDict = getPackagesFromXML(xml);
    if (latest)
		packagesDict = getLatestVersionPackages(packagesDict);
	var sort = true;
	if (sort)
	    packagesDict = sortPackages(packagesDict);
        
    var html = "<table border=\"1\">";
	//header
	html += "<tr><th>";
	html += "Package";
	html += "</th><th>";
	html += "Version";
	html += "</th><th>";
	html += "Description";
	html += "</th><th>";
	html += "Dependency";
	html += "</th></tr>";
    
    var num_pkg = 0;
    // ECMAScript 2017
	for (const [key, pkgObj] of Object.entries(packagesDict)) {
		// Write the data to the page.
		html += "<tr><td>";
		html += "<a href=\"" + pkgObj.projectURL + "\">" + pkgObj.name + "</a>";
		html += "</td><td>";
		html += "<a href=\"" + pkgObj.downloadURL + "\">" + pkgObj.version + "</a>";
		html += "</td><td>";
		html += pkgObj.description;
		html += "</td><td>";
		html += pkgObj.dependency();
		html += "</td></tr>";
		num_pkg ++;				
	}
	html += '</table>';

    var msg = "<p>Extract " + num_pkg;
    if (latest)
        msg += " unique";
    msg += " packages from " + xml + "</p>";
	
	html = msg + html;
	
    document.getElementById(divname).innerHTML = html;
}