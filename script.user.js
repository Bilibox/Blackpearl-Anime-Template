// ==UserScript==
// @name        Blackpearl Anime Poster
// @version     1.0.0
// @description Template Maker
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @include     *blackpearl.biz*
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM.setValue
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==

const htmlTemplate = `
<button id="gmShowTemplate" name="template_button" style="display:none" type="button">Show</button>
<div id="AnilistGenerator">
<input type="text" id="master_url" value="" style="display:none">
<div class="ui search" id="anilist_search">
<input type="text" class="prompt input" id="searchID" placeholder="Anime English Title" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Anime English Title'">
<div class="results input" style="display:none"></div>
</div>
<input type="text" id="ddl" value="" class="input" placeholder="Download Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Download Link'">
<div id="textarea_divider">&nbsp;</div>
<span>DownCloud</span>
<label class="switch">
<input type="checkbox" id="Downcloud" value="Downcloud" checked></input>
<span class="slider round"></span></label>
HideReactScore
<input type="number" id="HideReactScore" min="0" max="100" value="0">
HidePosts
<input type="number" id="HidePosts" min="0" max="50" value="0"> <br>
<div id="textarea_divider">&nbsp;</div>
<button id="gmGenerate" name="template_button" type="button">Generate Template</button>
<button id="gmClearBtn" name="template_button" type="reset">Clear</button>
<button id="gmHideTemplate" name="template_button" type="button">Hide</button>
</div>
`;

function main() {
	var htmlpush = document.getElementsByTagName('dd')[0];
	htmlpush.innerHTML += htmlTemplate;
	var titlechange = document.getElementsByName('title')[0];
	if (titlechange) {
		titlechange.className += 'input';
	}
	aniSearch();
	$('#gmHideTemplate').click(() => hideTemplate());
	$('#gmShowTemplate').click(() => showTemplate());
    $('#searchID').keyup(() => aniSearch());
	$('#gmGenerate').click(() => generateTemplate(titlechange));
}

$(document).on('keydown', function(event) {
	if (event.key == 'Escape') {
		$('#AnilistGenerator').hide();
		document.getElementById('gmShowTemplate').style.display = 'block';
	}
});

function hideTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'block';
	$('#AnilistGenerator').hide();
}

function showTemplate() {
	document.getElementById('gmShowTemplate').style.display = 'none';
	$('#AnilistGenerator').show();
}

function aniSearch() {
	var query = `query ($searchTerm:String){
      Page{
        media(search: $searchTerm, type: ANIME) {
          id,
          title {
            romaji
            english
            native
          },
          type,
          startDate {
            year
          },
          endDate {
            year
            month
            day
          }
          episodes,
          chapters,
          duration,
          averageScore,
          popularity,
          description,
          coverImage {
            large
          },
          genres,
          bannerImage,
          trailer {
            id
          },
          siteUrl,
          volumes,
          format,
        }
      }
    }
`;
	var variables = {
		searchTerm: document.getElementById('searchID').value
	};
    var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };

// Make the HTTP Api request
fetch(url, options).then(handleResponse)
                   .then(handleData)
                   .catch(handleError);
}

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleError(error) {
    alert('Error, check console');
    console.error(error);
}
    function handleData(data) {
    data = data.Page.media;
    $('#anilist_search').search({
        type: 'standard',
        source : data,
        searchFields : ['title'],
        onSelect
	});
}
//--- Use jQuery to activate the dialog buttons.
function generateTemplate() {
	var ddl = $('#ddl').val();
	var hidereactscore = $('#HideReactScore').val();
	var hideposts = $('#HidePosts').val();
	var master_url = $('#master_url').val();
	if (!master_url) {
		alert("You Didn't Select A Result or Enter a URL!");
	} else if (!ddl) {
		alert("Uh Oh! You Forgot Your Download Link! That's Pretty Important...");
	} else {
		if (Downcloud.checked) {
			ddl = '[DOWNCLOUD]' + ddl + '[/DOWNCLOUD]';
		}
		ddl = '[HIDEREACT=1,2,3,4,5,6]' + ddl + '[/HIDEREACT]';
		if (hidereactscore !== '0') {
			ddl = `[HIDEREACTSCORE=${hidereactscore}]` + ddl + '[/HIDEREACTSCORE]';
		}
		if (hideposts !== '0') {
			ddl = `[HIDEPOSTS=${hideposts}]` + ddl + '[/HIDEPOSTS]';
		}
		GM_xmlhttpRequest({
			method: 'GET',
			url: `~`,
			onload: function(response) {
				var json = JSON.parse(response.responseText);
				ddl =
					'[hr][/hr][center][size=6][color=rgb(44, 171, 162)][b]Download Link[/b][/color][/size]\n' +
					ddl +
					'\n[/center]';
				var dump = ``;
				GM_setClipboard(dump);
				try {
					document.getElementsByName('message')[0].value = dump;
				} catch (err) {
					alert(
						'You should be running this in BBCode Mode. Check the Readme for more information!\n' +
							err
					);
				} finally {
					var xf_title_value = document.getElementById('title').value;
					if (!xf_title_value) {
						document.getElementById('title').value = name;
					}
				}
			}
		});
	}
}
main();

//--- CSS styles make it work...
GM_addStyle(
	"                                                   \
    @media screen and (min-width: 300px) {                        \
      /* Divide Buttons */                                        \
      .divider{                                                   \
            width:                  8px;                          \
            height:                 auto;                         \
            display:                inline-block;                 \
      }                                                           \
      /* Buttons */                                               \
      button[name=template_button] {                              \
            background-color:       #4caf50;                      \
            color:                  white;                        \
            text-align:             center;                       \
            text-decoration:        none;                         \
            display:                inline-block;                 \
            font-size:              14px;                         \
            font-weight:            600;                          \
            padding:                4px;                          \
            cursor:                 pointer;                      \
            outline:                none;                         \
            margin-right:           8px;                          \
            border:                 none;                         \
            border-radius:          3px;                          \
            border-color:           #67bd6a;                      \
            margin-top:             5px;                          \
            box-shadow:             0 0 2px 0 rgba(0,0,0,0.14),   \
                                    0 2px 2px 0 rgba(0,0,0,0.12), \
                                    0 1px 3px 0 rgba(0,0,0,0.2);  \
        }                                                         \
      /* Reactscore & Posts */                                    \
      input[type=number]{                                         \
            border-bottom:          2px solid teal;               \
            border-image: linear-gradient(to right, #11998e,#38ef7d);\
            border-image-slice:     1;                            \
            background:             transparent;                  \
            color:                  white;                        \
            max-width:              35px;                         \
      }                                                           \
      #textarea_divider {                                         \
            margin-top:             -11px;                        \
      }                                                           \
      /* Start Rounded sliders Checkboxes */                      \
      .switch {                                                   \
            position:               relative;                     \
            display:                inline-block;                 \
            width:                  42px;                         \
            height:                 17px;                         \
      }                                                           \
      .switch input {                                             \
            opacity:                0;                            \
            width:                  0;                            \
            height:                 0;                            \
      }                                                           \
      .slider {                                                   \
            position:               absolute;                     \
            cursor:                 pointer;                      \
            top:                    0;                            \
            left:                   0;                            \
            right:                  0;                            \
            bottom:                 0;                            \
            background-color:       #ccc;                         \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      .slider:before {                                            \
            position:               absolute;                     \
            content:                '';                           \
            height:                 13px;                         \
            width:                  13px;                         \
            left:                   2px;                          \
            bottom:                 2px;                          \
            background-color:       #42464D;                      \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      input:checked + .slider {                                   \
            background-color:       #4caf50;                      \
      }                                                           \
      input:focus + .slider {                                     \
            box-shadow:             0 0 1px #4caf50;              \
      }                                                           \
      input:checked + .slider:before {                            \
            -webkit-transform:      translateX(26px);             \
            -ms-transform:          translateX(26px);             \
            transform:              translateX(26px);             \
      }                                                           \
      .slider.round {                                             \
            border-radius:          34px;                         \
      }                                                           \
      .slider.round:before {                                      \
            border-radius:          50%;                          \
      }                                                           \
}                                                                 \
    @media screen and (min-width: 768px) {                        \
      /* Divide Buttons */                                        \
      .divider{                                                   \
            width:                  15px;                         \
            height:                 auto;                         \
            display:                inline-block;                 \
      }                                                           \
      /* Buttons */                                               \
      button[name=template_button] {                              \
            background-color:       #4caf50;                      \
            color:                  white;                        \
            text-align:             center;                       \
            text-decoration:        none;                         \
            display:                inline-block;                 \
            font-size:              15px;                         \
            font-weight:            600;                          \
            padding:                6px;                          \
            cursor:                 pointer;                      \
            outline:                none;                         \
            margin-right:           8px;                          \
            border:                 none;                         \
            border-radius:          3px;                          \
            border-color:           #67bd6a;                      \
            margin-top:             5px;                          \
            box-shadow:             0 0 2px 0 rgba(0,0,0,0.14),   \
                                    0 2px 2px 0 rgba(0,0,0,0.12), \
                                    0 1px 3px 0 rgba(0,0,0,0.2);  \
        }                                                         \
      /* Reactscore & Posts */                                    \
      input[type=number]{                                         \
            border-bottom:          2px solid teal;               \
            border-image: linear-gradient(to right, #11998e,#38ef7d);\
            border-image-slice:     1;                            \
            background:             transparent;                  \
            color:                  white;                        \
            max-width:              35px;                         \
      }                                                           \
      #textarea_divider {                                         \
            margin-top:             -11px;                        \
      }                                                           \
      .switch {                                                   \
            position:               relative;                     \
            display:                inline-block;                 \
            width:                  42px;                         \
            height:                 17px;                         \
      }                                                           \
      .switch input {                                             \
            opacity:                0;                            \
            width:                  0;                            \
            height:                 0;                            \
      }                                                           \
      .slider {                                                   \
            position:               absolute;                     \
            cursor:                 pointer;                      \
            top:                    0;                            \
            left:                   0;                            \
            right:                  0;                            \
            bottom:                 0;                            \
            background-color:       #ccc;                         \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      .slider:before {                                            \
            position:               absolute;                     \
            content:                '';                           \
            height:                 13px;                         \
            width:                  13px;                         \
            left:                   2px;                          \
            bottom:                 2px;                          \
            background-color:       #42464D;                      \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      input:checked + .slider {                                   \
            background-color:       #4caf50;                      \
      }                                                           \
      input:focus + .slider {                                     \
            box-shadow:             0 0 1px #4caf50;              \
      }                                                           \
      input:checked + .slider:before {                            \
            -webkit-transform:      translateX(26px);             \
            -ms-transform:          translateX(26px);             \
            transform:              translateX(26px);             \
      }                                                           \
      /* Rounded sliders */                                       \
      .slider.round {                                             \
            border-radius:          34px;                         \
      }                                                           \
      .slider.round:before {                                      \
            border-radius:          50%;                          \
      }                                                           \
}                                                                 \
"
);
