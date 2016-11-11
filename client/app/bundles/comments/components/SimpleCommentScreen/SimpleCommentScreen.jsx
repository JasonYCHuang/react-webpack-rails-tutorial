import React from 'react';
import Immutable from 'immutable';
import request from 'axios';
import ReactOnRails from 'react-on-rails';

import BaseComponent from 'libs/components/BaseComponent';

import CommentForm from '../CommentBox/CommentForm/CommentForm';
import CommentList from '../CommentBox/CommentList/CommentList';
import css from './SimpleCommentScreen.scss';

export default class SimpleCommentScreen extends BaseComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      $$comments: Immutable.fromJS([]),
      isSaving: false,
      fetchCommentsError: null,
      submitCommentError: null,
      locale: 'en',
    };

    _.bindAll(this, 'fetchComments', 'handleCommentSubmit');
  }

  componentDidMount() {
    this.fetchComments();
    this.initialize18n();
  }

  fetchComments() {
    return (
      request
        .get('comments.json', { responseType: 'json' })
        .then(res => this.setState({ $$comments: Immutable.fromJS(res.data.comments) }))
        .catch(error => this.setState({ fetchCommentsError: error }))
    );
  }

  initialize18n() {
    I18n.defaultLocale = 'en';
    I18n.fallbacks     = true;
    this.setI18nLocale();
  }

  setI18nLocale() {
    I18n.locale = this.state.locale;
  }

  updateLocale(event) {
    this.setState({ locale: event.target.value });
  }

  handleCommentSubmit(comment) {
    this.setState({ isSaving: true });

    const requestConfig = {
      responseType: 'json',
      headers: ReactOnRails.authenticityHeaders(),
    };

    return (
      request
        .post('comments.json', { comment }, requestConfig)
        .then(() => {
          const { $$comments } = this.state;
          const $$comment = Immutable.fromJS(comment);

          this.setState({
            $$comments: $$comments.unshift($$comment),
            submitCommentError: null,
            isSaving: false,
          });
        })
        .catch(error => {
          this.setState({
            submitCommentError: error,
            isSaving: false,
          });
        })
    );
  }

  selectLanguage() {
    return (
      <select onChange={this.updateLocale.bind(this)} >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="ja">日本語</option>
        <option value="zh-CN">简体中文</option>
        <option value="zh-TW">正體中文</option>
      </select>
    );
  }

  render() {
    const cssTransitionGroupClassNames = {
      enter: css.elementEnter,
      enterActive: css.elementEnterActive,
      leave: css.elementLeave,
      leaveActive: css.elementLeaveActive,
    };
    this.setI18nLocale();

    return (
      <div className="commentBox container">
        <h2>{ I18n.t('comments') }</h2>
        { this.selectLanguage() }
        <p>{ I18n.t('description.support_markdown') }</p>
        <p>{ I18n.t('description.delete_rule') }</p>
        <p>{ I18n.t('description.submit_rule') }</p>

        <CommentForm
          isSaving={this.state.isSaving}
          actions={{ submitComment: this.handleCommentSubmit }}
          error={this.state.submitCommentError}
          cssTransitionGroupClassNames={cssTransitionGroupClassNames}
        />
        <CommentList
          $$comments={this.state.$$comments}
          error={this.state.fetchCommentsError}
          cssTransitionGroupClassNames={cssTransitionGroupClassNames}
        />
      </div>
    );
  }
}
