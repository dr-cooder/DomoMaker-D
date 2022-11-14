const helper = require('./helper.js');

const handleDomo = (e) => {
  e.preventDefault();
  helper.hideError();

  const nameEl = e.target.querySelector('#domoName');
  const ageEl = e.target.querySelector('#domoAge');
  const hasFavColorEl = e.target.querySelector('#domoHasFavColor');
  const favColorEl = e.target.querySelector('#domoFavColor');
  const _csrfEl = e.target.querySelector('#_csrf');

  const name = nameEl.value;
  const age = ageEl.value;
  const hasFavColor = hasFavColorEl.checked;
  const favColor = favColorEl.value;
  const _csrf = _csrfEl.value;

  if (!name || !age) {
    helper.handleError('All fields are required');
    return false;
  }

  const data = { name, age, _csrf }
  if (hasFavColor) data.favColor = favColor;

  helper.sendPost(e.target.action, data, () => loadDomosFromServer(_csrf));

  return false;
};

const requestDeleteDomo = (e) => {
  helper.hideError();

  helper.sendPost('/delete', e, () => loadDomosFromServer(e._csrf));
}

const DomoForm = (props) => {
  const [hasFavColor, setHasFavColor] = React.useState(false);
  const [favColor, setFavColor] = React.useState('#ff0000');
    
  return (
    <form id="domoForm"
      onSubmit={handleDomo}
      name="domoForm"
      action="/maker"
      method="POST"
      className="domoForm"
    >
      <label htmlFor="name">Name: </label>
      <input id="domoName" type="text" name="name" placeholder="Domo Name" />
      <label htmlFor="age">Age: </label>
      <input id="domoAge" type="number" min="0" name="age" />
      <label htmlFor="hasFavColor">Favorite Color? </label>
      <input id="domoHasFavColor" type="checkbox" name="hasFavColor"
        checked={hasFavColor} onChange={(e) => setHasFavColor(e.target.checked)} />
      <input id="domoFavColor" type="color"
        value={favColor} onChange={(e) => setFavColor(e.target.value)}
        style={{display: (hasFavColor ? 'block' : 'none')}} />
      <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
      <input className="makeDomoSubmit" type="submit" value="Make Domo" />
    </form>
  );
}

const DomoList = (props) => {
  if (props.domos.length === 0) {
    return (
      <div className="domoList">
        <h3 className="emptyDomo">No Domos Yet!</h3>
      </div>
    );
  }

  const domoNodes = props.domos.map(domo => {
    return (
      <div key={domo._id} className="domo">
        <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
        <div className="domoDescription">
          <div className="domoDescriptionLine">
            <h3 className="domoName">Name: {domo.name} </h3>
            <h3 className="domoAge">Age: {domo.age} </h3>
          </div>
          <div className="domoDescriptionLine">
            {domo.favColor && <h3 className="domoFavColor">
              Fav. Color:
              <span className="domoFavColorCircle" style={{ backgroundColor: domo.favColor }}>
                  <div className="domoFavColorCircleSpacer"></div>
              </span>
            </h3>}
            <button className="domoDelete" onClick={() => requestDeleteDomo({ _csrf: props.csrf, id: domo._id })}>Delete</button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="domoList">
      {domoNodes}
    </div>
  );
}

const loadDomosFromServer = async (_csrf) => {
  const response = await fetch('/getDomos');
  const data = await response.json();

  ReactDOM.render(
    <DomoList csrf={_csrf} domos={data.domos} />,
    document.getElementById('domos')
  );
}

const init = async () => {
  const response = await fetch('/getToken');
  const data = await response.json();
  const _csrf = data.csrfToken;

  ReactDOM.render(
    <DomoForm csrf={_csrf} />,
    document.getElementById('makeDomo')
  );

  ReactDOM.render(
    <DomoList csrf={_csrf} domos={[]} />,
    document.getElementById('domos')
  );

  loadDomosFromServer(_csrf);
}

window.onload = init;
