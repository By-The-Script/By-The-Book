import { db } from '../firebase.js'

export function renderArticles{
	const announcements = document.getElementById('announcements');
	const news = document.getElementById('news');
	const community = document.getElementById('community');
	const books = document.getElementById('new-books');
	
	if (announcements) announcements.innerHTML = `<div class="article" id="firstA"></div> <div class="article" id="secondA"></div> <div class="article" id="thirdA"></div> <div class="article" id="lastA"></div>`;
	if (news) news.innerHTML = `<div class="article" id="first"></div> <div class="article" id="second"></div> <div class="article" id="third"></div> <div class="article" id="last"></div>`;
	if (community) community.innerHTML = `<div class="article" id="first"></div> <div class="article" id="second"></div> <div class="article" id="third"></div> <div class="article" id="last"></div>`;
	if (books) books.innerHTML = `<div class="article" id="first"></div> <div class="article" id="second"></div> <div class="article" id="third"></div> <div class="article" id="last"></div>`;
	
	
	
}