// @ts-check

import { Environment } from "../../helpers/Environment.js";

/* global HTMLElement */
/* global customElements */
/* global CustomEvent */
/* global self */

/**
 * https://github.com/Weedshaker/event-driven-web-components-realworld-example-app/blob/master/FRONTEND_INSTRUCTIONS.md#article
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Article
 */
export default class Article extends HTMLElement {
  constructor () {
    super()

    this.user = null
    this.profile = null

    this.profileListener = event => {
      event.detail.fetch.then(({profile}) => this.render(profile, undefined))
    }

    this.userListener = event => {
      event.detail.fetch.then(user => this.render(undefined, user))
    }

    this.followBtnListener = event =>{
      if (!event.target) return false
      event.preventDefault()
      this.dispatchEvent(new CustomEvent('followUser', {
        /** @type {import("../controllers/MetaActions.js").SetFavoriteEventDetail} */
        detail: {
          profile: this.profile
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback () {
    // this.loadChildComponents()
    document.body.addEventListener('profile', this.profileListener)
    document.body.addEventListener('user', this.userListener)

  
    this.dispatchEvent(new CustomEvent('getProfile', {
      detail: {
        username: Environment.urlEnding
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))

    this.dispatchEvent(new CustomEvent('getUser', {
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback () {
    document.body.removeEventListener('profile', this.profileListener)
    document.body.removeEventListener('user', this.userListener)
    if (this.btnFollow) this.btnFollow.removeEventListener('click', this.followBtnListener)
  }

  /**
   * renders the profile
   *
   * @param {import("../../helpers/Interfaces.js").Profile} [profile = this.profile]
   * @param {import("../../helpers/Interfaces.js").User} [user = this.user]
   * @return {any}
   */
  render (profile = this.profile, user = this.user) {
    if (user) this.user = user
    if (profile) this.profile = profile
    if (!profile) return (this.innerHTML = '<div class="profile-page">An error occurred fetching the profile!</div>')
    console.log('changed', profile, user);
    this.innerHTML = /* html */`
    <div class="profile-page">

      <div class="user-info">
        <div class="container">
          <div class="row">

            <div class="col-xs-12 col-md-10 offset-md-1">
              <img src="${profile.image}" class="user-img" />
              <h4>${profile.username}</h4>
              <p>
              ${profile.bio || ''}
              </p>

              ${user && profile && user.username === profile.username ?
                `<a class="btn btn-outline-secondary btn-sm action-btn" href="#/settings">
                  <i class="ion-gear-a"></i> Edit Profile Settings
                </a>`
                : `<button name="follow" class="btn btn-sm  action-btn ${profile.following ? 'btn-secondary ' : 'btn-outline-secondary '}">
                  <i class="${profile.following ? 'ion-minus-round' : 'ion-plus-round'}"></i>
                  &nbsp;
                  ${profile.following ? 'Unfollow' : 'Follow'} ${profile.username}
                </button>`
              }
              </div>

          </div>
        </div>
      </div>

      <div class="container">
        <div class="row">
        <!--<div class="col-md-9">
              <m-article-feed-toggle></m-article-feed-toggle>

              <o-list-article-previews><div class="article-preview">Loading...</div></o-list-article-previews>

              <m-pagination></m-pagination>

            </div>-->

          <div class="col-xs-12 col-md-10 offset-md-1">
            <div class="articles-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <a class="nav-link active" href="">My Articles</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="">Favorited Articles</a>
                </li>
              </ul>
            </div>

            <div class="article-preview">
              <div class="article-meta">
                <a href=""><img src="http://i.imgur.com/Qr71crq.jpg" /></a>
                <div class="info">
                  <a href="" class="author">Eric Simons</a>
                  <span class="date">January 20th</span>
                </div>
                <button class="btn btn-outline-primary btn-sm pull-xs-right">
                  <i class="ion-heart"></i> 29
                </button>
              </div>
              <a href="" class="preview-link">
                <h1>How to build webapps that scale</h1>
                <p>This is the description for the post.</p>
                <span>Read more...</span>
              </a>
            </div>

            <div class="article-preview">
              <div class="article-meta">
                <a href=""><img src="http://i.imgur.com/N4VcUeJ.jpg" /></a>
                <div class="info">
                  <a href="" class="author">Albert Pai</a>
                  <span class="date">January 20th</span>
                </div>
                <button class="btn btn-outline-primary btn-sm pull-xs-right">
                  <i class="ion-heart"></i> 32
                </button>
              </div>
              <a href="" class="preview-link">
                <h1>The song you won't ever stop singing. No matter how hard you try.</h1>
                <p>This is the description for the post.</p>
                <span>Read more...</span>
                <ul class="tag-list">
                  <li class="tag-default tag-pill tag-outline">Music</li>
                  <li class="tag-default tag-pill tag-outline">Song</li>
                </ul>
              </a>
            </div>


          </div>

        </div>
      </div>

    </div>
    `
    if (this.btnFollow) this.btnFollow.addEventListener('click', this.followBtnListener)
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../molecules/ArticleFeedToggle.js').then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['m-article-feed-toggle', module.default]
      ),
      import('../organisms/ListArticlePreviews.js').then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['o-list-article-previews', module.default]
      ),
      import('../molecules/Pagination.js').then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['m-pagination', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // don't define already existing customElements
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  get btnFollow () {
    return this.querySelector('button[name=follow]')
  }
}
