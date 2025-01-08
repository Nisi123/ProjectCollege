const Explore = () => {
  return (
    <>
      <h1 className='exploreMainTitle'>Explore Projects</h1>
      <div className='search-barContainer'>
        <div className='search-bar'>
          <input
            type='text'
            placeholder='Search with filter'
          />
          <select>
            <option value='name'>Username</option>
            <option value='venue'>Project</option>
          </select>
        </div>
      </div>
      <div className='projectsContainer'>
        <div className='projectCard'>
          <img
            src=''
            alt=''
          />
          <div>
            <h2>Username</h2>
            <p>Info About Project</p>
          </div>
        </div>
      </div>
      <div className='pagination'></div>
    </>
  );
};

export default Explore;
