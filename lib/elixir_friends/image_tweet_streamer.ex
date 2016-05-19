defmodule ElixirFriends.ImageTweetStreamer do
  def stream(search_term) do
    IO.puts "Extwitter.stream_filter called"
    ExTwitter.stream_filter(track: search_term)
    |> Stream.filter(&has_images?/1)
    |> Stream.map(&store_tweet/1)
  end

  def has_images?(tweet) do
    IO.puts(tweet.text)
    Map.has_key?(tweet.entities, :media) &&
    Enum.any?(photos(tweet))
  end

  def store_tweet(tweet) do
    IO.puts "ElixirFriends.ImageTweetSteamer.store_tweet called"
    post = %ElixirFriends.Post{
      image_url: first_photo(tweet).media_url,
      content: tweet.text,
      source_url: first_photo(tweet).expanded_url,
      username: tweet.user.screen_name
    }
    ElixirFriends.Repo.insert(post)
    ElixirFriends.Endpoint.broadcast! "posts:new", "new:post", post
  end

  defp photos(tweet) do
    tweet.entities.media
    |> Enum.filter(fn(medium) ->
      medium.type == "photo"
    end)
  end

  defp first_photo(tweet) do
    photos(tweet)
    |> hd
  end
end