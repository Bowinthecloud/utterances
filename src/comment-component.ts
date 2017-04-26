import { IssueComment } from './github';
import { timeAgo } from './time-ago';

const avatarArgs = '?v=3&s=88';

export class CommentComponent {
  public readonly element: HTMLDivElement;

  constructor(
    public comment: IssueComment,
    private currentUser: string | null,
    repoOwner: string
  ) {
    const { user, html_url, created_at, body_html } = comment;
    this.element = document.createElement('div');
    this.element.classList.add('comment-wrapper');
    this.element.innerHTML = `
      <div class="comment-avatar">
        <a href="${user.html_url}" target="_blank">
          <img class="avatar" alt="@${user.login}" height="44" width="44"
               src="${user.avatar_url}${avatarArgs}">
        </a>
      </div>
      <div class="comment ${user.login === currentUser ? 'current-user' : ''}">
        <div class="comment-header">
          <div class="comment-header-text">
            <strong>
              <a class="author" href="${user.html_url}" target="_blank">${user.login}</a>
            </strong>
            commented
            <a class="timestamp" href="${html_url}" target="_blank">
              ${timeAgo(Date.now(), new Date(created_at))}
            </a>
          </div>
          ${repoOwner === user.login ? '<span class="comment-label">Owner</span>' : ''}
          <!--<div class="comment-actions"></div>-->
        </div>
        <div class="comment-body">
          ${body_html}
        </div>
      </div>`;

    this.retargetLinks();
  }

  public setComment(comment: IssueComment) {
    const commentDiv = this.element.lastElementChild as HTMLDivElement;
    const { user, html_url, created_at, body_html } = comment;

    if (this.comment.user.login !== user.login) {
      const avatarAnchor = this.element.firstElementChild!.firstElementChild as HTMLAnchorElement;
      const avatar = avatarAnchor.firstElementChild as HTMLImageElement;
      avatarAnchor.href = user.html_url;
      avatar.alt = '@' + user.login;
      avatar.src = user.avatar_url + avatarArgs;
      if (user.login === this.currentUser) {
        commentDiv.classList.add('current-user');
      } else {
        commentDiv.classList.remove('current-user');
      }

      const authorAnchor = commentDiv
        .firstElementChild!.firstElementChild!
        .firstElementChild!.firstElementChild as HTMLAnchorElement;
      authorAnchor.href = user.html_url;
      authorAnchor.textContent = user.login;
    }

    if (this.comment.created_at !== created_at || this.comment.html_url !== html_url) {
      const timestamp = commentDiv.firstElementChild!.firstElementChild!.lastElementChild as HTMLAnchorElement;
      timestamp.href = html_url;
      timestamp.textContent = timeAgo(Date.now(), new Date(created_at));
    }

    if (this.comment.body_html !== body_html) {
      const body = commentDiv.lastElementChild as HTMLDivElement;
      body.innerHTML = body_html;
      this.retargetLinks();
    }

    this.comment = comment;
  }

  public setCurrentUser(currentUser: string | null) {
    if (this.currentUser === currentUser) {
      return;
    }

    const commentDiv = this.element.firstElementChild as HTMLDivElement;
    if (this.comment.user.login === this.currentUser) {
      commentDiv.classList.add('current-user');
    } else {
      commentDiv.classList.remove('current-user');
    }

    this.currentUser = currentUser;
  }

  private retargetLinks() {
    const links = this.element.lastElementChild!.lastElementChild!.querySelectorAll('a');
    let j = links.length;
    while (j--) {
      const link = links.item(j);
      link.target = '_blank';
    }
  }

  // private fallbackEmoji() {
  //   const emojis = this.element.lastElementChild!.lastElementChild!.querySelectorAll('g-emoji');
  //   let i = emojis.length;
  //   while (i--) {
  //     const emoji = emojis.item(i);
  //     emoji.innerHTML = '';
  //     const img = document.createElement('img');
  //     img.classList.add('emoji');
  //     img.alt = emoji.getAttribute('alias') as string;
  //     img.height = 20;
  //     img.width = 20;
  //     img.src = emoji.getAttribute('fallback-src') as string;
  //     emoji.appendChild(img);
  //   }
  // }
}
