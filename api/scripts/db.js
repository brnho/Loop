const mongoose = require('mongoose');
const crypto = require('crypto');
const uuid = require('uuid');
const uuidv4 = uuid.v4;

const users = [];
for (let i = 0; i < 20; i++) {
	let user = {
		email: `example${i}@hotmail.com`,
		name: `Garry${i}`,
		password: `hello${i}`,
		avatarHash: crypto.createHash('md5').update(`example${i}@hotmail.com`).digest("hex"),
	};
	users.push(user);
}

const groups = [
	{
		name: 'ballers',
	},
	{
		name: 'bloods',
	},
];


const posts = [
	{ 
		text: `Setting up Gravatars on your site is easy; you don't even need an account! Plugins are available for 
		leading blog software and content management systems, and our tutorials will have you running Gravatars in no time.` 
	},
	{ 
		text: `Take a blissful dive into the lucid, intimate world of the classical guitar in this special 
		one-hour event combining guided meditation and live music. In the masterful hands of Artyom Dervoed, 
		the sound of the guitar takes on myriad colors and emotional inflections.` 
	},
	{ 
		text: `if you’re going to try, go all the way. there is no other feeling like that. 
		you will be alone with the gods and the nights will flame with fire.`	
	},
	{ 
		text: `I decided that the midterm will cover material through section 5.4 (Euler equations), but will 
		not include material from section 5.5 or beyond. However, we will still cover section 5.5 and part of 
		section 5.6 in class, and it will be covered on the final.`	
	},
	{ 
		text: `Whenever we use an offset into a list, we also need to ensure that the list is in the same order when
		queried multiple times. Without an explicit sort order, MongoDB does not guarantee any order in the output.
		The order of the documents may vary between two queries (although it appears to always be the order of
		insertion).`	
	},
	{ 
		text: `Now, we also need a count of pages, which needs the count of documents matching this filter. Instead
		of making another query to get the count, MongoDB lets us query the cursor itself for the number of
		documents it matched. `	
	},

];


/*
let posts = [];
for (let i = 0; i < 1000; i++) {
	let post = `${i} Hello world...`;
	posts.push(post);
}
*/

const comments = [
	{ 
		text: `Well said.` 
	},
	{ 
		text: `Cool comment bro` 
	},
	{ 
		text: `Nice weather today`	
	},
	{ 
		text: `What's up everybody?`	
	},
	{ 
		text: `Haha funny comment man`	
	},
	{ 
		text: `Well done sir`	
	},
	{
		text: `sounds good`	
	}
];

const subcomments = [
	{ 
		text: `kk` 
	},
	{ 
		text: `excellent reply` 
	},
	{ 
		text: `nothing ventured nothing gained`	
	},
	{ 
		text: `nicely put`	
	},
	{ 
		text: `This should return 10 issues and the total page count`	
	},
	{ 
		text: `Well done sir`	
	},

];

module.exports = { users, groups, posts, comments, subcomments };