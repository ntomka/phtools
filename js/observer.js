var Observer = {
	actUser: '',
	domain: '',
	topic: '',
	topicType: '',
	posts: -1,
	lastPostTime: '',
	toColorize: [0, 0],

	setURLVariables: function() {
		url = document.URL.split('/');
		Observer.domain = url[2];
		if (document.URL.search(/\/tema\//) != -1) {
			Observer.topicType = 'tema';
			Observer.topic = url[4];
        } else if (document.URL.search(/\/apro\//) != -1) {
			Observer.topicType = 'apro';
			Observer.topic = url[3] + '/' + url[4];
		} else if (document.URL.search(/\/bejegyzes\//) != -1) {
			Observer.topicType = 'bejegyzes';
			Observer.topic = url[4] + '/' + url[5];
		}
	},

	setActUser: function() {
		if (Observer.topicType != 'tema' && Observer.topicType != 'bejegyzes' && Observer.topicType != 'apro')
			return;
		if (
            Observer.domain == 'prohardver.hu'
            || Observer.domain == 'mobilarena.hu'
            || Observer.domain == 'itcafe.hu'
            || Observer.domain == 'gamepod.hu'
        ) {
			Observer.actUser = $$('div#right.flc > div > ul > li.access > p > a > em')[0];
        } else {
			Observer.actUser = $$('div > div > ul > li > p > a > em, div > div > ul > li > p > a > i')[0];
        }
        if (typeof Observer.actUser != 'undefined') {
            Observer.actUser = Observer.actUser.innerHTML;
        }
	},

	get: function(forward) {
		chrome.extension.sendMessage({
			requestSource: "observer",
			action: "get",
			topic: Observer.topic
		}, function(response) {
			forward(response);
		});
	},

	notification: function(method, forward, topic, data) {
		chrome.extension.sendMessage({
			requestSource: "observer",
			action: "notification",
            method: method,
			data: data,
            topic: topic
		}, function(response) {
            if (response && forward)
                forward(response);
		});
	},

	store: function(observedTopics) {
		chrome.extension.sendMessage({
			requestSource: "observer",
			action: "store",
			topic: Observer.topic,
			observedTopics: observedTopics
		});
	},

	colorize: function(observedTopics) {
		if (observedTopics == null || observedTopics.posts == null || observedTopics.posts.length == 0)
			return;
		var topicIndex;
		for (j = 0; j < observedTopics.posts.length; j++) {
			if (Observer.topic == observedTopics.posts[j].id) {
				topicIndex = j;
				// Ha a topicba belépünk, közben érkezett új, de nem volt ráfrissítve az automata által, akkor
				// nem jelölte olvasatlannak, hanem a setRead()-del olvasottnak jelölte.
				// Ez így egy hack, majd optimalizálni!
				if (observedTopics.posts[j].lastPosts < Observer.getPosts() && observedTopics.posts[j].newPosts != Observer.getPosts() - observedTopics.posts[j].lastPosts)
					observedTopics.posts[j].newPosts = Observer.getPosts() - observedTopics.posts[j].lastPosts;
				continue;
			}
			if (observedTopics.posts[j].id.search('/') != -1)
				type = 'bejegyzes';
			else if (observedTopics.posts[j].id.search('apro/') != -1)
				type = 'apro';
			else
				type = 'tema';

            if ( type == 'apro' )
                links = [
                    'li > p > a[href^="/' + observedTopics.posts[j].id + '/"]',
                    'td > a[href^="/' + observedTopics.posts[j].id + '/"]'
                ];
            else
                links = [
                    'li > p > a[href^="/' + type + '/' + observedTopics.posts[j].id + '/"]',
                    'td > a[href^="/' + type + '/' + observedTopics.posts[j].id + '/"]'
                ];
            links.each( function ( item ) {
				topicOnPage = $$( item );
				if ( topicOnPage.length != 0 && observedTopics.posts[j].newPosts ) {
					topicOnPage.addClass( 'red' );
				}
			} );
		}
		if (Observer.topicType == 'tema' || Observer.topicType == 'bejegyzes' || Observer.topicType == 'apro') {
			j = topicIndex;
			if (j == undefined || observedTopics.posts[j].newPosts == 0)
				return;
			if (
				Observer.domain == 'prohardver.hu'
				|| Observer.domain == 'mobilarena.hu'
				|| Observer.domain == 'itcafe.hu'
				|| Observer.domain == 'gamepod.hu'
			) {
				posts1 = $$('div.msgblk:not(.thrcnt) div.msg.flc');
				permalinks = $$('div.msgblk:not(.thrcnt) div.msg.flc > div.hlist.head.flc > p > a[title~="Sorszám"]');
				posters = $$('div.msgblk:not(.thrcnt) div.msg.flc > div.hlist.head.flc > p');
			}
			else {
				posts1 = $$('div.uzik');
				permalinks = $$('div.uzik > div.fejlec > h4 > a[title~="Sorszám"]');
				posters = $$('div.uzik > div.fejlec > h4');
			}
			direction = Observer.getDirection();
			countActUserPosts = 0;
			Observer.toColorize[0] = observedTopics.posts[j].newPosts;
			for (i = 0; i < observedTopics.posts[j].newPosts; i++) {
				if (i < posts1.length) {
					u = direction == -1 ? i : posts1.length - i - 1;
					actPostNum = permalinks[u].innerHTML.substr(1);
					if (actPostNum <= observedTopics.posts[j].lastPosts)
						break;
					Observer.toColorize[1]++;
					if (posters[u].childNodes[3].innerHTML == Observer.actUser) {
						countActUserPosts++;
						continue;
					}
					if ( !posts1[u].hasClass( 'isnew' ) ) {
						posts1[u].addClass( 'isnew' );
					}
					continue;
				}
				else {
					Observer.toColorize[1] = observedTopics.posts[j].newPosts;
					break;
				}
			}
			pageTitle = document.getElementsByTagName('title')[0];
			newTitle = observedTopics.posts[j].newPosts - countActUserPosts > 0 ? '(' + observedTopics.posts[j].newPosts + ') ' + pageTitle.innerHTML : pageTitle.innerHTML;
			pageTitle.innerHTML = newTitle;
		}
	},

	addStars: function(observedTopics) {
		if (Observer.topicType == 'tema' || Observer.topicType == 'bejegyzes' || Observer.topicType == 'apro') {
			if (observedTopics != null)
				starImageSrc = chrome.extension.getURL("images/star.png");
			else
				starImageSrc = chrome.extension.getURL("images/star-none.png");
			starAttributes = {
				src: starImageSrc,
				alt: "o",
				title: "Téma figyelése",
				height: "13px"
			};
			if (
				Observer.domain == 'prohardver.hu'
				|| Observer.domain == 'mobilarena.hu'
				|| Observer.domain == 'itcafe.hu'
				|| Observer.domain == 'gamepod.hu'
			) {
				fejlecek = new Array();
				fejlecek[0] = $$('div.path.patht.fpath')[0];
				fejlecek[1] = $$('div.path.pathb.fpath')[0];
				spanAttributes = {
					"class": "mod"
				};
			} else {
                if (Observer.domain == 'logout.hu' && Observer.topicType == 'bejegyzes')
                    fejlecek = $$('div.fnavi.nofejlec');
                else if (Observer.domain == 'hardverapro.hu')
                    fejlecek = $$('div.aprosel.uzisel.nofejlec');
                else
                    fejlecek = $$('div.fpath.nofejlec');
				logout = '';
				if ( (Observer.domain == 'logout.hu' && Observer.topicType == 'bejegyzes') || Observer.domain == 'hardverapro.hu' )
					logout = ' float: right; margin: 5px 5px 0px 0px;';
				spanAttributes = {
					style: "padding: 0; background: none;" + logout
				};
			}
			if ( (Observer.domain == 'logout.hu' && Observer.topicType == 'bejegyzes') || Observer.domain == 'hardverapro.hu' )
				where = 'top';
			else
				where = 'bottom';
			["addObserverTop", "addObserverBottom"].each(function(item, i) {
				span = new Element('span', spanAttributes);
				starAttributes.id = item;
				img = new Element('img', starAttributes);
				img.inject(span);
				span.inject(fejlecek[i], where);
			});
		}
	},

	setRead: function(observedTopics) {
        //console.log(Observer.topicType, observedTopics);
		if ((Observer.topicType == 'tema' || Observer.topicType == 'bejegyzes' || Observer.topicType == 'apro') && observedTopics != null) {
			if (document.URL.search(/\/keres.php\?/) != -1)
				return;
			observedTopics.posts = Observer.getPosts();
	        //console.log(observedTopics.posts);
			observedTopics.lastPost = Observer.getLastPostTime();
			Observer.store(observedTopics);
			Observer.notification("get", function(r) {
				//console.log(r);
				if (r.notification != null) {
                    r.notification.newPosts = 0;
                    r.notification.lastPosts = Observer.getPosts();
                    r.notification.posts = Observer.getPosts();
                    Observer.notification("set", null, Observer.topic, r.notification);
                }
			}, Observer.topic);
		}
	},

	run: function(observedTopics) {
		Observer.addStars(observedTopics);
		if (Observer.toColorize[0] == Observer.toColorize[1])
			Observer.setRead(observedTopics);
		Observer.addEvents();
	},

	getDirection: function() {
		if (Observer.direction == null)
			if (
				Observer.domain == 'prohardver.hu'
				|| Observer.domain == 'mobilarena.hu'
				|| Observer.domain == 'itcafe.hu'
				|| Observer.domain == 'gamepod.hu'
			) {
				Observer.direction = $$('div#navi_top_prefs > div[class="ddm"] > a > b')[1].innerHTML.search(/csökkenő/i) != -1 ? -1 : 1;
			}
			else
				Observer.direction = $$('select[name="listsett"] > option')[0].innerHTML.search(/csökkenő/i) != -1 ? -1 : 1;
		return Observer.direction;
	},

	getPosts: function(topic) {
		if (Observer.posts == -1) {
			if (Observer.topicType == 'tema' || Observer.topicType == 'bejegyzes' || Observer.topicType == 'apro') {
				direction = Observer.getDirection();
				if (
					Observer.domain == 'prohardver.hu'
					|| Observer.domain == 'mobilarena.hu'
					|| Observer.domain == 'itcafe.hu'
					|| Observer.domain == 'gamepod.hu'
				) {
					if (direction == -1)
						posts = parseInt($$('div#navi_top_pages > div > div.menu > ul > li > a > span')[0].innerHTML);
					else {
						tmp = $$('div#navi_top_pages > div > div.menu > ul > li > a > span');
						posts = parseInt(tmp[tmp.length - 1].innerHTML);
					}
				} else if (Observer.domain == 'hardverapro.hu') {
                    if (direction == -1) {
                        tmp = $$('div.aprosel.uzisel.nofejlec > form.ugro > select[name="ugro"]')[0].childNodes[2].innerHTML;
                        if (tmp == undefined)
                            posts = 0;
                        else
                            posts = parseInt(tmp.substring(0, tmp.search(/[^0-9]/)));
                    } else {
                        tmp = $$('div.aprosel.uzisel.nofejlec > form.ugro > select[name="ugro"]')[0].lastChild.innerHTML;
						if (tmp == undefined)
                            posts = 0;
                        else
                            posts = parseInt(tmp.substr(tmp.lastIndexOf(';') + 1));
                    }
				} else {
					if (direction == -1) {
						tmp = $$('div.fnavi.nofejlec > form.ugro > select[name="ugro"]')[0].childNodes[2].innerHTML;
						posts = parseInt(tmp.substring(0, tmp.search(/[^0-9]/)));
					} else {
						tmp = $$('div.fnavi.nofejlec > form.ugro > select[name="ugro"]')[0].lastChild.innerHTML;
						posts = parseInt(tmp.substr(tmp.lastIndexOf(';') + 1));
					}
				}
			} else if (document.URL.search(/\/temak\//) != -1) {
				if (Observer.domain == 'prohardver.hu' || Observer.domain == 'mobilarena.hu')
					titles = $$('td[class="title"] > a');
				else
					titles = $$('td[class="level1"] > a');
				posts = -1;
				for (k = 0; k < titles.length; k++)
					if (titles[k].href.search(topic) != -1) {
						posts = parseInt($$('td[class="num_msg"]')[k].innerHTML.replace(' ', ''));
						break;
					}
			}
			Observer.posts = posts;
		}
		return Observer.posts;
	},

	getLastPostTime: function() {
		direction = Observer.getDirection();
		if (Observer.lastPostTime == '') {
			if (
				Observer.domain == 'prohardver.hu'
				|| Observer.domain == 'mobilarena.hu'
				|| Observer.domain == 'itcafe.hu'
				|| Observer.domain == 'gamepod.hu'
			) {
				if (direction == -1)
					lastPostTime = $$('div.msgblk:not(.thrcnt) li.time')[0].innerHTML;
				else {
					tmp = $$('div.msgblk:not(.thrcnt) li.time');
					lastPostTime = tmp[tmp.length - 1].innerHTML;
				}
			} else {
				if (direction == -1) {
					tmp = $$('div.uzik > div.fejlec > div')[0];
                    if (tmp == undefined) {
                        // hardverapró 0 hsz
                        d = new Date();
                        lastPostTime = d.getFullYear()+'-'
                            +(d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1))+'-'
                            +(d.getDate() < 10 ? '0'+d.getDate() : d.getDate())+' '
                            +d.getHours()+':'
                            +(d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes())+':'
                            +(d.getSeconds() < 10 ? '0'+d.getSeconds() : d.getSeconds());
                    } else
                        lastPostTime = tmp.innerHTML.substr(tmp.innerHTML.lastIndexOf('>') + 2);
				} else {
					tmp = $$('div.uzik > div.fejlec > div');
					if (tmp == undefined || tmp.length == 0) {
                        // hardverapró 0 hsz
                        d = new Date();
                        lastPostTime = d.getFullYear()+'-'
                            +(d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1))+'-'
                            +(d.getDate() < 10 ? '0'+d.getDate() : d.getDate())+' '
                            +d.getHours()+':'
                            +(d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes())+':'
                            +(d.getSeconds() < 10 ? '0'+d.getSeconds() : d.getSeconds());
                    } else {
                        tmp = tmp[tmp.length - 1].innerHTML;
                        lastPostTime = tmp.substr(tmp.lastIndexOf('>') + 2);
                    }
				}
			}
			Observer.lastPostTime = lastPostTime;
		}
		return Observer.lastPostTime;
	},

	addEvents: function() {
		['addObserverTop', 'addObserverBottom'].each(function(item) {
			if ($(item) != null)
				$(item).addEvents({
					'mouseover': function() {
						$(item).style.cursor = "pointer";
						$(item).src = chrome.extension.getURL("images/star-half.png");
					},
					'mouseout': function() {
						Observer.get(function(observedTopics) {
							$(item).style.cursor = "auto";
							if (observedTopics != null && document.URL.search(observedTopics.id) != -1) {
								$(item).src = chrome.extension.getURL("images/star.png");
								return;
							}
							$(item).src = chrome.extension.getURL("images/star-none.png");
						});
					},
					'click': function() {
						Observer.get(function(observedTopics) {
							var posts = Observer.getPosts();
							var title = '';
							if (Observer.domain == 'logout.hu' && Observer.topicType == 'bejegyzes')
								title = $$('div#midh > div#midhcontent > div > h1')[0].innerHTML;
							else {
                                if (Observer.topicType == 'apro')
                                    title = $$('div.fbc.flc > h1');
                                else
                                    title = $$('a[href^="/' + Observer.topicType + '/' + Observer.topic + '/friss.html"], ' +
                                        'a[href^="/' + Observer.topicType + '/' + Observer.topic + '/hsz_1-25.html"], ' +
                                        'a[href^="/' + Observer.topicType + '/' + Observer.topic + '/hsz_1-50.html"], ' +
                                        'a[href^="/' + Observer.topicType + '/' + Observer.topic + '/hsz_1-100.html"], ' +
                                        'a[href^="/' + Observer.topicType + '/' + Observer.topic + '/hsz_1-200.html"]');
								for (i = 0; i < title.length; i++)
									if (title[i].innerHTML.search(/(gyorskeresés itt|<img|<|>)/) == -1) {
										title = title[i].innerHTML;
										break;
									}
							}
							if (observedTopics == null) {
								observedTopics = {
									id: Observer.topic,
									posts: posts,
									title: title,
									domain: Observer.domain,
									lastPost: Observer.getLastPostTime()
								};
							} else {
								observedTopics = null;
								Observer.notification("get", function(r) {
                                    deleted = false;
									if (r.notification != null)
                                        Observer.notification("set", null, Observer.topic, null);
								}, Observer.topic);
							}
							Observer.store(observedTopics);
						});
					}
				});
		});
	}
}

window.addEvent('domready', function() {
	Observer.setURLVariables();
	Observer.setActUser();
	Observer.notification("get", Observer.colorize);
	Observer.get(Observer.run);
});