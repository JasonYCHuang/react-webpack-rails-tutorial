import React from 'react';
import Immutable from 'immutable';
import request from 'axios';
import ReactOnRails from 'react-on-rails';
import I18n from 'i18n-js';
import BaseComponent from 'libs/components/BaseComponent';

import CommentForm from '../CommentBox/CommentForm/CommentForm';
import CommentList from '../CommentBox/CommentList/CommentList';
import css from './SimpleCommentScreen.scss';
import { InitI18n, SelectLanguage, SetI18nLocale } from '../../common/i18n';

export default (props, railsContext) => (
  <SimpleCommentScreen {...props} railsContext={railsContext} />
);

class SimpleCommentScreen extends BaseComponent {
  constructor(props) {
    super(props);
    const { railsContext } = props;

    this.state = {
      $$comments: Immutable.fromJS([]),
      isSaving: false,
      fetchCommentsError: null,
      submitCommentError: null,
      locale: null,
    };

    InitI18n(railsContext);
    _.bindAll(this, 'fetchComments', 'handleCommentSubmit', 'handleSetI18nLocale');
  }

  componentDidMount() {
    this.fetchComments();
    this.handleSetI18nLocale(this.props.railsContext.i18nLocale);
  }

  fetchComments() {
    return (
      request
        .get('comments.json', { responseType: 'json' })
        .then(res => this.setState({ $$comments: Immutable.fromJS(res.data.comments) }))
        .catch(error => this.setState({ fetchCommentsError: error }))
    );
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

  handleSetI18nLocale(locale) {
    this.setState({ locale: locale });
  }

  render() {
    const cssTransitionGroupClassNames = {
      enter: css.elementEnter,
      enterActive: css.elementEnterActive,
      leave: css.elementLeave,
      leaveActive: css.elementLeaveActive,
    };
    const { locale } = this.state;
    SetI18nLocale(locale); 

    return (
      <div className="commentBox container">
        <h2>{ I18n.t('comments') }</h2>
        { SelectLanguage(this.handleSetI18nLocale) }
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
