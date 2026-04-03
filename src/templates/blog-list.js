import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import PostBlog from 'components/PostBlog'
import * as S from './styled'

const BlogList = ({ posts }) => {
  const sortedPosts = [...posts].sort((post1, post2) =>
    new Date(post1.date) > new Date(post2.date) ? -1 : 1
  )

  const [count, setCount] = useState({
    prev: 0,
    next: 10
  })
  const [hasMore, setHasMore] = useState(true)
  const [current, setCurrent] = useState(
    sortedPosts.slice(count.prev, count.next)
  )

  const getMoreData = () => {
    if (current.length === sortedPosts.length) {
      setHasMore(false)
      return
    }

    setCurrent(
      current.concat(sortedPosts.slice(count.prev + 10, count.next + 10))
    )

    setCount(prevState => ({
      prev: prevState.prev + 10,
      next: prevState.next + 10
    }))
  }

  return (
    <S.BlogListWrapper>
      <InfiniteScroll
        dataLength={current.length}
        next={getMoreData}
        hasMore={hasMore}
      >
        {current.map(post => (
          <PostBlog
            key={post.slug}
            image={post.frontmatter.image}
            slug={`blog/${post.slug}`}
            title={post.frontmatter.title}
            timeToRead={`• ${post.readTime}`}
            date={post.frontmatter.formattedDate}
            description={post.frontmatter.description}
            main_class={post.frontmatter['main-class']}
          />
        ))}
      </InfiniteScroll>
    </S.BlogListWrapper>
  )
}

export default BlogList
