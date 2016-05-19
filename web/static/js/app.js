// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
//import "deps/phoenix_html/web/static/js/phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

//import socket from "./socket"
import {Socket} from "deps/phoenix/web/static/js/phoenix"

let App = {

}

let PostList = React.createClass({
  getInitialState(){
    return {
      posts: []
    }
  },
  componentDidMount(){
    $.get(this.props.source, result => {
      result = JSON.parse(result)
      this.setState({
        posts: result.entries
      })
      this.subscribeToNewPosts()
    })
  },
  subscribeToNewPosts(){
    let socket = new Socket("/socket")
    socket.connect()
    let channel = socket.channel("posts:new", {})
    channel.join().receive("ok", chan => {
      console.log("joined")
    })
    channel.on("new:post", post => {
      this.injectNewPost(post)
    })
  },
  injectNewPost(post){
    this.setState({
      posts: [post].concat(this.state.posts)
    })
  },
  render() {
    return(
      <div className="ui grid stackable">
        {this.state.posts.map(function(post){
          return <Post imageUrl={post.image_url} username={post.username} insertedAt={post.inserted_at} content={post.content} />
        })}
      </div>
    )
  }
})

let Post = React.createClass({
  render() {
    return(
      <div className="four wide column">
        <div className="ui card">
          <div className="image">
            <img src={this.props.imageUrl} />
          </div>
          <div className="content">
            <div className="header">
              {this.props.username}
            </div>
            <div className="meta">
              <span className="date">{this.props.insertedAt}</span>
            </div>
            <div className="description">
              {this.props.content}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
window.onload = () => {
  let element = document.getElementById("app")
  React.render(<PostList source="/api/posts" />, element)
}

export default App



