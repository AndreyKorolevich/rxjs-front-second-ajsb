import { ajax } from 'rxjs/ajax';
import { concatMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

export default class Widget {
  constructor(container) {
    this.container = container;
    this.posts = [];
  }

  start() {
    this.showWidget();
    this.api().subscribe((value) => {
      this.posts.forEach((post, index) => {
        this.addPost(post, value[index]);
      });
    });
  }

  showWidget() {
    const widget = document.createElement('div');
    widget.classList.add('widget');
    widget.innerHTML = `
      <p class="name">Posts</p>
      <div class="list"></div>
    `;

    this.container.appendChild(widget);
  }

  addPost(pos, com) {
    const post = document.createElement('div');
    post.classList.add('post');

    post.innerHTML = `
      <header class="head">
        <img src="${pos.avatar}" class="avatar">
        <div class="info">
            <div class="post-name">${pos.author}</div>
            <div class="post-date">${pos.created}</div>
        </div>
      </header>
      <article class="content">
        <img class="img" src="${pos.content}" alt="picture">
        <div class="footer">
            <p class="last">Latest comments</p>
            ${this.addComment(com).outerHTML}
        </div>
      </article>
    `;
    this.container.querySelector('.list').appendChild(post);
  }
  /* eslint-disable */

  addComment(data) {
    const comments = document.createElement('div');
    comments.classList.add('comments');

    data.comments.forEach((e) => {
      const comment = document.createElement('div');
      comment.classList.add('comment');
      comment.innerHTML = `
        <img src="${e.avatar}" class="comment-avatar">
          <div class="comment-main">
            <div class="comment-name">${e.author}</div>
            <div class="comment-text">${e.message}</div>
            </div>
            <div class="comment-date">${e.date}</div>
      `;
      comments.appendChild(comment);
    });
    return comments;
  }


  api() {
    return ajax.getJSON('https://rxjs-homework-backend.herokuapp.com/posts/latest').pipe(
      concatMap((data) => {
        const result = [];
        data.posts.forEach(elem => {
          this.posts.push(elem);
          result.push(ajax.getJSON(`https://rxjs-homework-backend.herokuapp.com/posts/comments/latest?post_id=${elem.post_id}`))
        })
        return forkJoin(result);
      }),
    );
  }
}

