'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// required variables and functions
var render = ReactDOM.render;
var Redux = window.Redux;
var Provider = ReactRedux.Provider;
var createStore = Redux.createStore;
var applyMiddleware = Redux.applyMiddleware;
var combineReducers = Redux.combineReducers;
var bindActionCreators = Redux.bindActionCreators;
var compose = Redux.compose;
var ReduxThunk = window.ReduxThunk.default;
var Component = React.Component;
var PropTypes = React.PropTypes;
var connect = ReactRedux.connect;
var classnames = window.classNames;
var Router = window.ReactRouter.Router;
var Route = window.ReactRouter.Route;
var hashHistory = window.ReactRouter.hashHistory;
var Link = window.ReactRouter.Link;
var syncHistoryWithStore = window.ReactRouterRedux.syncHistoryWithStore;
var routerReducer = window.ReactRouterRedux.routerReducer;
var routerMiddleware = window.ReactRouterRedux.routerMiddleware;
var push = window.ReactRouterRedux.push;
var S = window.S;
var SEARCH_REQUEST = 'SEARCH_REQUEST';
var SEARCH_FAILED = 'SEARCH_FAILED';
var SEARCH_SUCCESS = 'SEARCH_SUCCESS';

var USER_REQUEST = 'USER_REQUEST';
var USER_FAILED = 'USER_FAILED';
var USER_SUCCESS = 'USER_SUCCESS';

var INPUT_QUERY = 'INPUT_QUERY';
var TOGGLE_USER_DETAILS_PAYLOAD = 'TOGGLE_USER_DETAILS_PAYLOAD';

// reducer
function search() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {
    results: [],
    query: '',
    fetching: false,
    failure: false
  } : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case SEARCH_REQUEST:
      return Object.assign({}, state, {
        fetching: true,
        failure: false,
        results: []
      });
    case SEARCH_FAILED:
      return Object.assign({}, state, {
        fetching: false,
        failure: true,
        results: []
      });
    case SEARCH_SUCCESS:
      return Object.assign({}, state, {
        fetching: false,
        failure: false,
        results: action.results
      });
    case INPUT_QUERY:
      return Object.assign({}, state, {
        query: action.query
      });
    default:
      return state;
  }
}

function user() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {
    fetchingUser: false,
    failureUser: false,
    userDetails: {},
    showFullDetailsPayload: false
  } : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case TOGGLE_USER_DETAILS_PAYLOAD:
      return Object.assign({}, state, {
        showFullDetailsPayload: !state.showFullDetailsPayload
      });
    case USER_REQUEST:
      return Object.assign({}, state, {
        fetchingUser: true,
        failureUser: false,
        userDetails: {},
        showFullDetailsPayload: false
      });
    case USER_FAILED:
      return Object.assign({}, state, {
        fetchingUser: false,
        failureUser: true,
        userDetails: {},
        showFullDetailsPayload: false
      });
    case USER_SUCCESS:
      return Object.assign({}, state, {
        fetchingUser: false,
        failureUser: false,
        userDetails: action.userDetails,
        showFullDetailsPayload: false
      });
    default:
      return state;
  }
}

// actions
function toggleUserDetailsPayloadView() {
  return {
    type: TOGGLE_USER_DETAILS_PAYLOAD
  };
}

function requestList() {
  return {
    type: SEARCH_REQUEST
  };
}

function receiveList(list) {
  return {
    type: SEARCH_SUCCESS,
    results: list

  };
}

function errorList(data) {
  return {
    type: SEARCH_FAILED
  };
}

function requestUser() {
  return {
    type: USER_REQUEST
  };
}

function receiveUser(userDetails) {
  return {
    type: USER_SUCCESS,
    userDetails: userDetails

  };
}

function errorUser(data) {
  return {
    type: USER_FAILED
  };
}

function inputQuery(query) {
  return {
    type: INPUT_QUERY,
    query: query
  };
}

// async action to fetch quote
function fetchList() {
  return function (dispatch, getState) {
    var query = getState().search.query;

    dispatch(requestList());

    fetch('https://api.github.com/search/users?q=' + query, {
      method: 'get'
    }).then(function (response) {
      return response.json();
    }).then(function (jsonResponse) {
      if ('items' in jsonResponse && jsonResponse.items.length > 0) {
        dispatch(receiveList(jsonResponse.items));
      } else {
        dispatch(errorList(jsonResponse));
      }
    }).catch(function (err) {
      dispatch(errorList(err));
    });
  };
}

function fetchUser(username) {
  return function (dispatch, getState) {

    dispatch(requestUser());

    fetch('https://api.github.com/users/' + username, {
      method: 'get'
    }).then(function (response) {
      return response.json();
    }).then(function (jsonResponse) {
      if ('message' in jsonResponse && jsonResponse.message == "Not Found") {
        dispatch(errorUser(jsonResponse));
      } else {
        fetch(jsonResponse.repos_url, {
          method: 'get'
        }).then(function (response) {
          return response.json();
        }).then(function (jsonResponseRepos) {
          var jsonResponseRepo = Object.assign({}, jsonResponse, {
            repo_list: jsonResponseRepos
          });
          dispatch(receiveUser(jsonResponseRepo));
        }).catch(function (err) {
          dispatch(errorUser(err));
        });
      }
    }).catch(function (err) {
      dispatch(errorUser(err));
    });
  };
}

var InputSearch = function (_Component) {
  _inherits(InputSearch, _Component);

  function InputSearch() {
    _classCallCheck(this, InputSearch);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  InputSearch.prototype.render = function render() {
    var _props = this.props;
    var query = _props.query;
    var fetching = _props.fetching;
    var onQueryChange = _props.onQueryChange;
    var onSearch = _props.onSearch;

    var searchIcon = classnames({
      'fa fa-fw': true,
      'fa-search': fetching === false,
      'fa-spinner fa-pulse': fetching === true
    });

    return React.createElement(
      'form',
      {
        className: 'form-inline',
        onSubmit: function onSubmit(event) {
          event.preventDefault();
          onSearch();
        } },
      React.createElement(
        'div',
        { className: 'input-group input-group-lg col-xs-12' },
        React.createElement('input', {
          className: 'form-control',
          type: 'text',
          placeholder: 'Enter Username',
          value: query,
          title: 'Search',
          autoFocus: true,
          onChange: function onChange(event) {
            return onQueryChange(event.target.value);
          } }),
        React.createElement(
          'span',
          { className: 'input-group-btn' },
          React.createElement(
            'button',
            {
              type: 'submit',
              className: 'btn btn-default' },
            React.createElement('i', { className: searchIcon, 'aria-hidden': 'true' })
          )
        )
      )
    );
  };

  return InputSearch;
}(Component);

var Result = function (_Component2) {
  _inherits(Result, _Component2);

  function Result() {
    _classCallCheck(this, Result);

    return _possibleConstructorReturn(this, _Component2.apply(this, arguments));
  }

  Result.prototype.render = function render() {
    var _props2 = this.props;
    var result = _props2.result;
    var onFetchUser = _props2.onFetchUser;

    var imgClass = classnames({
      'hide': !('avatar_url' in result),
      'img-responsive': 'avatar_url' in result,
      'col-xs-2': 'avatar_url' in result
    });
    var contentClass = classnames({
      'col-xs-12': !('avatar_url' in result),
      'col-xs-10': 'avatar_url' in result
    });

    var thumbImage = "#";
    if ('avatar_url' in result) {
      thumbImage = result.avatar_url;
    }

    return React.createElement(
      'div',
      { className: 'panel panel-default' },
      React.createElement(
        'div',
        { className: 'panel-body' },
        React.createElement('img', { className: imgClass,
          src: thumbImage }),
        React.createElement(
          Link,
          {
            className: contentClass,
            to: '/' + result.login,
            onClick: function onClick() {
              return onFetchUser(result.login);
            }
          },
          React.createElement(
            'h4',
            null,
            result.login
          )
        ),
        React.createElement('div', { className: 'clearfix' })
      )
    );
  };

  return Result;
}(Component);

var Results = function (_Component3) {
  _inherits(Results, _Component3);

  function Results() {
    _classCallCheck(this, Results);

    return _possibleConstructorReturn(this, _Component3.apply(this, arguments));
  }

  Results.prototype.render = function render() {
    var _props3 = this.props;
    var results = _props3.results;
    var failure = _props3.failure;
    var onFetchUser = _props3.onFetchUser;

    var renderedResults = results.map(function (result, index) {
      return React.createElement(Result, { key: index, result: result, onFetchUser: onFetchUser });
    });

    return React.createElement(
      'div',
      null,
      !failure && renderedResults,
      failure && React.createElement(
        'p',
        { className: 'lead text-center' },
        'failed to get anything'
      )
    );
  };

  return Results;
}(Component);

var SearchPage = function (_Component4) {
  _inherits(SearchPage, _Component4);

  function SearchPage() {
    _classCallCheck(this, SearchPage);

    return _possibleConstructorReturn(this, _Component4.apply(this, arguments));
  }

  SearchPage.prototype.render = function render() {
    var _props4 = this.props;
    var results = _props4.results;
    var failure = _props4.failure;
    var onFetchUser = _props4.onFetchUser;
    var query = _props4.query;
    var fetching = _props4.fetching;
    var onQueryChange = _props4.onQueryChange;
    var onSearch = _props4.onSearch;

    return React.createElement(
      'div',
      null,
      React.createElement(InputSearch, {
        query: query,
        fetching: fetching,
        onQueryChange: onQueryChange,
        onSearch: onSearch }),
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement(Results, {
        onFetchUser: onFetchUser,
        results: results,
        failure: failure })
    );
  };

  return SearchPage;
}(Component);

var UserDetails = function (_Component5) {
  _inherits(UserDetails, _Component5);

  function UserDetails() {
    _classCallCheck(this, UserDetails);

    return _possibleConstructorReturn(this, _Component5.apply(this, arguments));
  }

  UserDetails.prototype.render = function render() {
    var _props5 = this.props;
    var fetchingUser = _props5.fetchingUser;
    var failureUser = _props5.failureUser;
    var userDetails = _props5.userDetails;
    var toggleDetailsPayload = _props5.toggleDetailsPayload;
    var showFullDetailsPayload = _props5.showFullDetailsPayload;

    var repos = userDetails.repo_list;
    console.log(userDetails);
    if (!("repo_list" in userDetails)) {
      var smallRepoList = {};
    } else {
      var smallRepoList = userDetails.repo_list.map(function (item) {
        return item.name;
      });
    }
    var userDetailsSansRepos = Object.assign({}, userDetails, {
      repo_list: smallRepoList
    });

    return React.createElement(
      'div',
      { className: 'col-xs-12 col-sm-12 col-md-4 col-lg-4' },
      "avatar_url" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement('img', { className: 'img-responsive', src: userDetails.avatar_url })
      ),
      "name" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(
          'h2',
          null,
          React.createElement(
            'a',
            { href: userDetails.html_url ? userDetails.html_url : '#' },
            userDetails.name
          ),
          React.createElement(
            'small',
            null,
            '(',
            userDetails.login,
            ')'
          )
        )
      ),
      "company" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(
          'h3',
          null,
          userDetails.company
        )
      ),
      "blog" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(
          'h4',
          null,
          React.createElement(
            'a',
            { href: userDetails.blog },
            userDetails.blog
          )
        )
      ),
      "email" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(
          'h4',
          null,
          userDetails.email
        )
      ),
      "location" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(
          'h3',
          null,
          userDetails.location
        )
      ),
      "bio" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(
          'p',
          null,
          userDetails.bio
        )
      ),
      "followers" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-6' },
        React.createElement(
          'h4',
          null,
          'Followers: ',
          userDetails.followers
        )
      ),
      "following" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-6' },
        React.createElement(
          'h4',
          null,
          'Following: ',
          userDetails.following
        )
      ),
      "public_repos" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-6' },
        React.createElement(
          'h4',
          null,
          'Repos: ',
          userDetails.public_repos
        )
      ),
      "public_gists" in userDetails && React.createElement(
        'div',
        { className: 'col-xs-6' },
        React.createElement(
          'h4',
          null,
          'Gists: ',
          userDetails.public_gists
        )
      ),
      userDetails && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(
          'h4',
          null,
          React.createElement(
            'a',
            { className: 'link-hover-hand',
              onClick: function onClick() {
                return toggleDetailsPayload();
              } },
            'Click for Full Payload with Repos:'
          )
        ),
        showFullDetailsPayload && React.createElement(
          'pre',
          null,
          JSON.stringify(userDetailsSansRepos, undefined, 2)
        )
      )
    );
  };

  return UserDetails;
}(Component);

var RepoListItem = function (_Component6) {
  _inherits(RepoListItem, _Component6);

  function RepoListItem() {
    _classCallCheck(this, RepoListItem);

    return _possibleConstructorReturn(this, _Component6.apply(this, arguments));
  }

  RepoListItem.prototype.render = function render() {
    var repoDetails = this.props.repoDetails;

    return React.createElement(
      'li',
      { className: 'list-group-item' },
      React.createElement(
        'div',
        { className: 'panel panel-default' },
        React.createElement(
          'div',
          { className: 'panel-heading' },
          React.createElement(
            'h4',
            { className: 'panel-title' },
            React.createElement(
              'a',
              { className: 'col-xs-8 col-sm-9 col-md-9 col-lg-9',
                href: repoDetails.html_url },
              repoDetails.name
            ),
            React.createElement(
              'div',
              { className: 'col-xs-4 col-sm-3 col-md-3 col-lg-3' },
              React.createElement(
                'span',
                { className: 'badge' },
                repoDetails.language
              )
            ),
            React.createElement('div', { className: 'clearfix' })
          )
        ),
        "description" in repoDetails && repoDetails.description != "" && React.createElement(
          'div',
          { className: 'panel-body' },
          React.createElement(
            'p',
            null,
            repoDetails.description
          )
        )
      )
    );
  };

  return RepoListItem;
}(Component);

var UserRepoList = function (_Component7) {
  _inherits(UserRepoList, _Component7);

  function UserRepoList() {
    _classCallCheck(this, UserRepoList);

    return _possibleConstructorReturn(this, _Component7.apply(this, arguments));
  }

  UserRepoList.prototype.render = function render() {
    var _props6 = this.props;
    var fetchingUser = _props6.fetchingUser;
    var failureUser = _props6.failureUser;
    var userDetails = _props6.userDetails;

    var repoListTags = userDetails.repo_list.map(function (item) {
      return React.createElement(RepoListItem, { repoDetails: item });
    });

    return React.createElement(
      'div',
      { className: 'col-xs-12 col-sm-12 col-md-8 col-lg-8' },
      React.createElement(
        'h3',
        null,
        ' List of User\'s Repositories '
      ),
      React.createElement(
        'ul',
        { className: 'list-group' },
        repoListTags
      )
    );
  };

  return UserRepoList;
}(Component);

var UserPage = function (_Component8) {
  _inherits(UserPage, _Component8);

  function UserPage() {
    _classCallCheck(this, UserPage);

    return _possibleConstructorReturn(this, _Component8.apply(this, arguments));
  }

  UserPage.prototype.render = function render() {
    var _props7 = this.props;
    var fetchingUser = _props7.fetchingUser;
    var onFetchUser = _props7.onFetchUser;
    var failureUser = _props7.failureUser;
    var userDetails = _props7.userDetails;
    var toggleDetailsPayload = _props7.toggleDetailsPayload;
    var showFullDetailsPayload = _props7.showFullDetailsPayload;

    var searchIcon = classnames({
      'fa fa-fw': true,
      'fa-search': fetchingUser === false,
      'fa-spinner fa-pulse': fetchingUser === true
    });

    return React.createElement(
      'div',
      { className: 'row' },
      fetchingUser && React.createElement(
        'div',
        { className: 'col-xs-12 text-center' },
        React.createElement('i', { className: searchIcon, 'aria-hidden': 'true' })
      ),
      !fetchingUser && React.createElement(
        'div',
        { className: 'col-xs-12' },
        React.createElement(UserDetails, {
          userDetails: userDetails,
          failureUser: failureUser,
          fetchingUser: fetchingUser,
          toggleDetailsPayload: toggleDetailsPayload,
          showFullDetailsPayload: showFullDetailsPayload }),
        React.createElement(UserRepoList, {
          userDetails: userDetails,
          failureUser: failureUser,
          fetchingUser: fetchingUser })
      )
    );
  };

  return UserPage;
}(Component);

var App = function (_Component9) {
  _inherits(App, _Component9);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, _Component9.apply(this, arguments));
  }

  App.prototype.render = function render() {
    var _props8 = this.props;
    var results = _props8.results;
    var query = _props8.query;
    var fetching = _props8.fetching;
    var failure = _props8.failure;
    var onQueryChange = _props8.onQueryChange;
    var onSearch = _props8.onSearch;
    var params = _props8.params;
    var onFetchUser = _props8.onFetchUser;
    var fetchingUser = _props8.fetchingUser;
    var failureUser = _props8.failureUser;
    var userDetails = _props8.userDetails;
    var toggleDetailsPayload = _props8.toggleDetailsPayload;
    var showFullDetailsPayload = _props8.showFullDetailsPayload;

    return React.createElement(
      'div',
      { className: 'container' },
      React.createElement(
        'div',
        { className: 'jumbotron' },
        !params.username && React.createElement(SearchPage, {
          query: query,
          fetching: fetching,
          onQueryChange: onQueryChange,
          onFetchUser: onFetchUser,
          onSearch: onSearch,
          results: results,
          failure: failure }),
        params.username && React.createElement(UserPage, {
          fetchingUser: fetchingUser,
          onFetchUser: onFetchUser,
          failureUser: failureUser,
          userDetails: userDetails,
          toggleDetailsPayload: toggleDetailsPayload,
          showFullDetailsPayload: showFullDetailsPayload }),
        React.createElement('div', { className: 'clearfix' })
      )
    );
  };

  return App;
}(Component);

// // proptypes required for App component
// App.propTypes = {
//   results: PropTypes.array.isRequired,
//   query: PropTypes.string.isRequired,
//   fetching: PropTypes.bool.isRequired,
//   failure: PropTypes.bool.isRequired,
//   onClick: PropTypes.func.isRequired,
// }

// helper functions for app container

function mapStateToProps(state) {
  var search = state.search;
  var user = state.user;
  var results = search.results;
  var query = search.query;
  var fetching = search.fetching;
  var failure = search.failure;
  var fetchingUser = user.fetchingUser;
  var failureUser = user.failureUser;
  var userDetails = user.userDetails;
  var showFullDetailsPayload = user.showFullDetailsPayload;

  return { results: results, query: query, fetching: fetching, failure: failure,
    fetchingUser: fetchingUser, failureUser: failureUser, userDetails: userDetails,
    showFullDetailsPayload: showFullDetailsPayload };
}

function mapDispatchToProps(dispatch) {
  return {
    onSearch: function onSearch() {
      return dispatch(fetchList());
    },
    onQueryChange: function onQueryChange(query) {
      return dispatch(inputQuery(query));
    },
    onFetchUser: function onFetchUser(username) {
      return dispatch(fetchUser(username));
    },
    toggleDetailsPayload: function toggleDetailsPayload() {
      return dispatch(toggleUserDetailsPayloadView());
    }
  };
}

// create app container using connect()
var AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

// create store using middlewares
var rootReducer = combineReducers({
  search: search,
  user: user,
  routing: routerReducer
});

// create default store
var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
var store = createStore(rootReducer, composeEnhancers(applyMiddleware(ReduxThunk)));

var appHistory = syncHistoryWithStore(hashHistory, store);

// render the app to the page
render(React.createElement(
  Provider,
  { store: store },
  React.createElement(
    Router,
    { history: appHistory },
    React.createElement(Route, { path: '/(:username)', component: AppContainer })
  )
), document.getElementById('app'));