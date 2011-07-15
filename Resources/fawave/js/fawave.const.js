// require FaWave.Language

(function(){

window.FaWave = window.FaWave || {};



//需要不停检查更新的timeline的分类列表
var T_LIST = {
	'all': ['friends_timeline','mentions','comments_timeline','direct_messages'],
	'digu': ['friends_timeline','mentions', 'direct_messages'],
	'buzz': ['friends_timeline'],
	'facebook': ['friends_timeline'],
	'plurk': ['friends_timeline'],
	'douban': ['friends_timeline', 'direct_messages'],
	'tianya': []
};
T_LIST.t163 = T_LIST.tsina = T_LIST.tsohu = T_LIST.all;
T_LIST.tqq = T_LIST.fanfou = T_LIST.renjian = T_LIST.zuosa 
	= T_LIST.follow5 = T_LIST.leihou = T_LIST.twitter 
	= T_LIST.identi_ca = T_LIST.tumblr = T_LIST.digu;

var T_NAMES = {
	'tsina': '新浪微博',
	'tqq': '腾讯微博',
	'tsohu': '搜狐微博',
	't163': '网易微博',
	'douban': '豆瓣',
	'fanfou': '饭否',
	'digu': '嘀咕',
//	'tianya': '天涯微博',
	'zuosa': '做啥',
	'leihou': '雷猴',
	'renjian': '人间网',
//	'follow5': 'Follow5', // f5的api实在太弱了，无法做完美
	'twitter': 'Twitter',
	'facebook': 'Facebook',
	'plurk': 'Plurk',
	'buzz': 'Google Buzz',
    'identi_ca': 'identi.ca'
//    'tumblr': 'Tumblr'
};

//刷新时间限制
var refreshTimeLimit = {
    'tsina':{
        'friends_timeline': 30, 
        'mentions': 30, 
        'comments_timeline': 30, 
        'direct_messages': 30,
        'sent_direct_messages': 60
    },
    'tqq':{
        'friends_timeline': 45, 
        'mentions': 45, 
        'comments_timeline': 45, 
        'direct_messages': 45,
        'sent_direct_messages': 60
    },
    'follow5':{
        'friends_timeline': 45, 
        'mentions': 60, 
        'comments_timeline': 60, 
        'direct_messages': 60,
        'sent_direct_messages': 60
    }
};
refreshTimeLimit.tianya = refreshTimeLimit.digu = refreshTimeLimit.twitter = refreshTimeLimit.identi_ca = refreshTimeLimit.tsohu = refreshTimeLimit.t163 = refreshTimeLimit.fanfou = refreshTimeLimit.plurk = refreshTimeLimit.tsina;
refreshTimeLimit.renjian = refreshTimeLimit.zuosa = refreshTimeLimit.follow5 = refreshTimeLimit.leihou = refreshTimeLimit.douban = refreshTimeLimit.buzz = refreshTimeLimit.tqq;

var tabDes = {
    'friends_timeline': FaWave.i18n._('comm_TabName_friends_timeline'), 
    'mentions': FaWave.i18n._('comm_TabName_mentions'), 
    'comments_timeline': FaWave.i18n._('comm_TabName_comments_timeline'), 
    'direct_messages': FaWave.i18n._('comm_TabName_direct_messages')
};

// 伪装成微博AIR
var TSINA_APPKEYS = {
    'weibo_air': ['微博AIR', '3434422667', '523f2d0d134bfd5aa138f9e5af828bf9'],
    'fawave': ['FaWave', '3538199806', '18cf587d60e11e3c160114fd92dd1f2b']
};

/****
 * constant 常量
 */
FaWave.CONST = {
    T_LIST:             T_LIST,
    T_NAMES:            T_NAMES,
    tabDes:             tabDes,
    TSINA_APPKEYS:      TSINA_APPKEYS,
    refreshTimeLimit:   refreshTimeLimit
};


})();