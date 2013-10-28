ObserverBG = {
	networkErrorNotified: false,
	notificationHandlerTimeout: null,
	tmpDiv: new Element("div"),
	notifications: [],
	toolbarIcon: null,
	que: [],

	initialize: function(toolbarIcon) {
		ObserverBG.priorityReq();
		ObserverBG.toolbarIcon = toolbarIcon;
	},

	getRefreshInterval: function() {
		if (this.que.length > 0 && 60000 / this.que.length > 15000)
			return 60000 / this.que.length;
		return 15000;
	},

	getPriority: function(d) {
		n = (new Date() - new Date(d)) / 3600000;
		if (n < 1) // 1 óra
			return 1;
		if (n < 2) // 2 óra
			return 2;
		if (n < 4) // 4 óra
			return 3;
		if (n < 8) // 8 óra
			return 4;
		if (n < 16) // 16 óra
			return 5;
		if (n < 24) // 1 nap
			return 6;
		if (n < 48) // 2 nap
			return 7;
		if (n < 72) // 3 nap
			return 8;
		if (n < 168) // 1 hét
			return 9;
		return 10; // 1 hétnél régebbi
	},

	getMaxReqNum: function(priority) {
		var retval = 0;
		for (k = 0; k < ObserverBG.que.length; k++)
			if (ObserverBG.que[k].priority == priority && ObserverBG.que[k].reqNum > retval)
				retval = ObserverBG.que[k].reqNum;
		if (0 == retval)
			retval = 1;
		return retval;
	},

	setQue: function() {
        // felvesszük az új topicokat a listára, a meglévőknél beállítjuk a legutolsó
        // dátumot és egyebet, valamint frissítjük a prioritást
		if ( MSG.loginNeed ) {
			ObserverBG.que = [];
			return;
		}
        tmp = observedTopicsDatabase.getAll();
        for (i = 0; i < tmp.length; i++) {
            for (j = 0; j < ObserverBG.que.length; j++)
                if (ObserverBG.que[j].id == tmp[i].id) {
                    newPriority = ObserverBG.getPriority(tmp[i].lastPost);
                    if (ObserverBG.que[j].lasPost < tmp[i].lastPost || ObserverBG.que[j].priority != newPriority) {
                        ObserverBG.que[j].lasPost = tmp[i].lastPost;
                        newReqNum = ObserverBG.getMaxReqNum(newPriority);
                        if (ObserverBG.que[j].reqNum != -1 && newReqNum == 1)
                            ObserverBG.que[j].reqNum = Math.floor((ObserverBG.que[j].reqNum * ObserverBG.que[j].priority) / newPriority);
                        else
                            ObserverBG.que[j].reqNum = newReqNum;
                        ObserverBG.que[j].priority = newPriority;
                    }
                    break;
                }
            if (j >= ObserverBG.que.length)
                ObserverBG.que.push({
                    id: tmp[i].id,
                    lastPost: tmp[i].lastPost,
                    priority: ObserverBG.getPriority(tmp[i].lastPost),
                    reqNum: -1,
                    domain: tmp[i].domain
                });
        }
        // tisztítjuk a listát
        if (ObserverBG.que.length != tmp.length) {
            for (i = 0; i < ObserverBG.que.length; i++) {
                for (j = 0; j < tmp.length; j++)
                    if (ObserverBG.que[i].id == tmp[j].id)
                        break;
                if (j >= tmp.length)
                    ObserverBG.que[i] = null;
            }
            ObserverBG.que = ObserverBG.que.clean();
        }
        // Rendezzük dátum szerint csökkenőben
        ObserverBG.que.sort(function(a, b) {
            if (a.lastPost > b.lastPost)
                return -1;
            if (a.lastPost < b.lastPost)
                return 1;
            return 0;
        });
	},

	selectIndex: function() {
		act = [-1, Number.MAX_VALUE];
		for (i = 0; i < ObserverBG.que.length; i++) {
			if (ObserverBG.que[i].reqNum == -1)
				return i;
			if (ObserverBG.que[i].priority * ObserverBG.que[i].reqNum < act[1]) {
				act[0] = i;
				act[1] = ObserverBG.que[i].priority * ObserverBG.que[i].reqNum;
			}
		}
		return act[0];
	},

	priorityReq: function() {
		ObserverBG.setQue();
		if (ObserverBG.que.length == 0)
			window.setTimeout("ObserverBG.priorityReq()", 5000);
		else {
			var i = ObserverBG.selectIndex();
			ObserverBG.reqForTopic(ObserverBG.que[i].id, ObserverBG.que[i].domain);
			ObserverBG.que[i].reqNum = ObserverBG.que[i].reqNum == -1 ? ObserverBG.getMaxReqNum(ObserverBG.que[i].priority) : ObserverBG.que[i].reqNum + 1;
			ObserverBG.setQue();

			this.setWindowTimeout(this.getRefreshInterval());
		}
	},

	setWindowTimeout: function(timeout) {
		window.setTimeout("ObserverBG.priorityReq()", timeout);
	},

	notification: function() {
		c = 0;
		for (i = 0; i < ObserverBG.notifications.length; i++)
			if (ObserverBG.notifications[i].newPosts > 0)
				c++;
		ObserverBG.toolbarIcon.setTopicCounter(c);
	},

	cleanNotifications: function() {
        for (i = 0; i < ObserverBG.notifications.length; i++)
            if ( ObserverBG.notifications[i] && observedTopicsDatabase.get(ObserverBG.notifications[i].id) == null )
                ObserverBG.notifications[i] = null;
        ObserverBG.notifications = ObserverBG.notifications.clean();
	},

    setNofitication: function(topic, data) {
        for (i = 0; i < ObserverBG.notifications.length; i++)
            if ( ObserverBG.notifications[i].id == topic ) {
                ObserverBG.notifications[i] = data;
                break;
            }
        ObserverBG.cleanNotifications();
    },

	setRead: function(topic) {
		for (i = 0; i < ObserverBG.notifications.length; i++)
			if ( ObserverBG.notifications[i].id == topic ) {
				ObserverBG.notifications[i].lastPosts = ObserverBG.notifications[i].posts;
				ObserverBG.notifications[i].newPosts = 0;
				break;
			}
		ObserverBG.notification();
	},

    getNotification: function(topic) {
        for (i = 0; i < ObserverBG.notifications.length; i++)
            if ( ObserverBG.notifications[i].id == topic )
                return ObserverBG.notifications[i];
        return null;
    },

	reqForTopic: function(topic, domain) {
		ObserverBG.cleanNotifications();
        if (domain == 'hardverapro.hu')
            topicType = 'apro';
		else if (topic.search('/') != -1)
			topicType = 'bejegyzes';
		else
			topicType = 'tema';
        var url = '';
        if (domain == 'hardverapro.hu')
            url = 'http://' + domain + '/' + topic + '/friss.html';
        else
            url = 'http://' + domain + '/' + topicType + '/' + topic + '/friss.html';
		req = new Request({
			method: 'GET',
			url: url,
			onSuccess: function(response) {
				try {
					response = response.replace(/src=\"\//g, "src=\"http:\/\/"+domain+"\/");
					ObserverBG.tmpDiv.innerHTML = response.substring(response.indexOf('>', response.indexOf(response.match(/<body/i))) + 1,
						response.indexOf(response.match(/<\/body>/i)));
					if (
						domain == 'prohardver.hu'
						|| domain == 'mobilarena.hu'
						|| domain == 'itcafe.hu'
						|| domain == 'gamepod.hu'
					) {
						direction = ObserverBG.tmpDiv.getElements('div[id="navi_top_prefs"] > div.ddm > a > b')[1].innerHTML.search(/csökkenő/i) != -1 ? -1 : 1;
					} else {
						direction = ObserverBG.tmpDiv.getElements('select[name="listsett"] > option')[0].innerHTML.search(/csökkenő/i) != -1 ? -1 : 1;
					}
                    var topicFromDb = observedTopicsDatabase.get(topic);
					if (
						domain == 'prohardver.hu'
						|| domain == 'mobilarena.hu'
						|| domain == 'itcafe.hu'
						|| domain == 'gamepod.hu'
					) {
						if (direction == -1) {
							posts = parseInt(ObserverBG.tmpDiv.getElements('div[id="navi_top_pages"] > div > div.menu > ul > li > a > span')[0].innerHTML);
							lastPostTime = ObserverBG.tmpDiv.getElements('div.msgblk:not(.thrcnt) li.time')[0].innerHTML;
						} else {
							tmp = ObserverBG.tmpDiv.getElements('div[id="navi_top_pages"] > div > div.menu > ul > li > a > span');
							posts = parseInt(tmp[tmp.length - 1].innerHTML);
							tmp = ObserverBG.tmpDiv.getElements('li.time');
							lastPostTime = tmp[tmp.length - 1].innerHTML;
						}
                    } else if (domain == 'hardverapro.hu') {
                        if (direction == -1) {
                            tmp = ObserverBG.tmpDiv.getElements('div.aprosel.uzisel.nofejlec > form.ugro > select[name="ugro"]')[0].childNodes[1].innerHTML;
                            posts = tmp.substring(0, tmp.search(/[^0-9]/));
                            if (!posts.length) {
                                posts = 0;
                                lastPostTime = topicFromDb.lastPost;
                            } else {
                                posts = parseInt(posts);
                                tmp = ObserverBG.tmpDiv.getElements('div.uzik > div.fejlec > div')[0].innerHTML;
                                lastPostTime = tmp.substr(tmp.lastIndexOf('>') + 2);
                            }
                        } else {
                            tmp = ObserverBG.tmpDiv.getElements('div.aprosel.uzisel.nofejlec > form.ugro > select[name="ugro"]')[0].childNodes[1].innerHTML;
                            posts = parseInt(tmp.substr(tmp.lastIndexOf(';') + 1));
                            if (isNaN(posts)) {
                                posts = 0;
                                lastPostTime = topicFromDb.lastPost;
                            } else {
                                posts = parseInt(posts);
                                tmp = ObserverBG.tmpDiv.getElements('div.uzik > div.fejlec > div');
                                tmp = tmp[tmp.length - 1].innerHTML;
                                lastPostTime = tmp.substr(tmp.lastIndexOf('>') + 2);
                            }
                        }
                    } else {
						if (direction == -1) {
							tmp = ObserverBG.tmpDiv.getElements('div.fnavi.nofejlec > form.ugro > select[name="ugro"]')[0].childNodes[1].innerHTML;
							posts = parseInt(tmp.substring(0, tmp.search(/[^0-9]/)));
							tmp = ObserverBG.tmpDiv.getElements('div.uzik > div.fejlec > div')[0].innerHTML;
							lastPostTime = tmp.substr(tmp.lastIndexOf('>') + 2);
						} else {
							tmp = ObserverBG.tmpDiv.getElements('div.fnavi.nofejlec > form.ugro > select[name="ugro"]')[0].childNodes[1].innerHTML;
							posts = parseInt(tmp.substr(tmp.lastIndexOf(';') + 1));
							tmp = ObserverBG.tmpDiv.getElements('div.uzik > div.fejlec > div');
							tmp = tmp[tmp.length - 1].innerHTML;
							lastPostTime = tmp.substr(tmp.lastIndexOf('>') + 2);
						}
					}
                    if ( topicFromDb ) {
                        topicFromDb.lastPost = lastPostTime;
                        title = topicFromDb.title;
                        lastPosts = topicFromDb.posts;
                        observedTopicsDatabase.set(topic, topicFromDb);
                    }
					lastNotifiedPosts = 0;
					added = false;
					for (i = 0; i < ObserverBG.notifications.length; i++)
						if (ObserverBG.notifications[i].id == topic) {
							lastNotifiedPosts = ObserverBG.notifications[i].newPosts;
							added = true;
							break;
						}
					if (topicType == 'apro')
						jump = '';
					else if (topicType == 'bejegyzes')
						jump = '#rel_msgs';
					else
						jump = '#msg' + posts;
                    // url + jump
					if (posts - lastPosts == 1 && lastNotifiedPosts == 0) {
						Notifications.add("topic", "Új hozzászólás!", '1 új hozzászólást adtak hozzá a(z) ' + title + ' témában!', {
                            buttons: [{title: 'Megnyitás'}]
                        });
                    } else if (posts - lastPosts > 1 && lastNotifiedPosts == 0) {
						Notifications.add("topic", "Új hozzászólások!", (posts - lastPosts) + ' új hozzászólást adtak hozzá a(z) ' + title + ' témában!', {
                            buttons: [{title: 'Megnyitás'}]
                        });
                    } else if (posts - lastPosts > 1 && lastNotifiedPosts != posts - lastPosts) {
						Notifications.add("topic", "Új hozzászólások!", (posts - lastPosts) +
							" új hozzászólást (" + (posts - lastPosts - lastNotifiedPosts) +
							' a legutolsó értesítés óta) adtak hozzá a(z) ' + title + ' témában!', {
                            buttons: [{title: 'Megnyitás'}]
                        });
                    }
					if (added) {
						ObserverBG.notifications[i].newPosts = posts - lastPosts;
						ObserverBG.notifications[i].lastPosts = lastPosts;
						ObserverBG.notifications[i].posts = posts;
					} else
						ObserverBG.notifications.include({
                            id: topic,
                            newPosts: posts - lastPosts,
                            lastPosts: lastPosts,
                            posts: posts
                        });
					ObserverBG.notification();
				} catch(e) {
					ObserverBG.tmpDiv.innerHTML = "";
					console.log(new Date(), "ReqSuccessError");
					ObserverBG.reqErrorHandler();
				}
				MSG.networkErrorNotified = false;
			},
			onFailure: function(xhr) {
				console.log(new Date(), "ReqFailure: ", xhr);
				ObserverBG.reqErrorHandler();
			},
			onCancel: function() {
				console.log(new Date(), "ReqCancelled");
				ObserverBG.reqErrorHandler();
			},
			onException: function(headerName, value) {
				console.log(new Date(), "ReqException: ", headerName, "=", value);
				ObserverBG.reqErrorHandler();
			}
		});
		try {
			req.send();
		} catch(e) {
			console.log(new Date(), e);
		}
	},

	reqErrorHandler: function() {
		if (!ObserverBG.networkErrorNotified) {
			Notifications.add("networkError", "Téma lekérdezés meghíúsult!", "Nem sikerült csatlakozni a Prohardver! szerveréhez!");
			ObserverBG.networkErrorNotified = true;
		}
	}
};
