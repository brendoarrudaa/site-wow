import PostBlog from 'components/PostBlog'

const Hit = props => {
  const { hit } = props

  return (
    <PostBlog
      slug={hit.fields.slug}
      title={hit.title}
      image={hit.image}
      date={hit.date}
      description={hit.description}
      main_class={hit.main_class}
    />
  )
}

export default Hit
