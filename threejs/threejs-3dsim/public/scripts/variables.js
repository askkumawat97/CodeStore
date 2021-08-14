

// WORLD
world_width = 10; //horizontal grid count
world_height = 8; //vertical grid count
world_gridSize = 20;
world_gridSizeSqr = world_gridSize*world_gridSize;

world_gridIndPrev = 0; // previous grid
world_gridInd = 0; // user grid location interpreted in single variable
gridIndX = 0;
gridIndY = 0;
gridPosInd = 0; //inside user grid exact loc of user interpreted in single variable
gridPosX = 0;
gridPosY = 0;
view_width_oneside = 3; // must be >= 0
view_height_oneside = 2; // must be >= 0
view_base = 0;
view_width = 2 * view_width_oneside + 1;
view_height = 2 * view_height_oneside + 1;

view_data = []
view_data_1 = []




// DIRECTORIES

dir_home				= "https://localhost:8080/"
dir_home				= ''

dir_assets				= dir_home + "assets/"
dir_css					= dir_home + "css/"
dir_images				= dir_home + "images/"
dir_modules				= dir_home + "modules_inbuilt/"
dir_modules_udef		= dir_home + "modules_userDefined/"
dir_scripts				= dir_home + "scripts/"

dir_assets_users		= dir_assets + "users/"
dir_assets_terrains		= dir_assets + "terrains/"
dir_assets_architects	= dir_assets + "architects/"
dir_assets_trees		= dir_assets + "trees/"
dir_assets_objects		= dir_assets + "objects/"

dir_modules_jquery		= dir_modules + "jquery/"
dir_modules_threejs		= dir_modules + "threejs/"




// MYSQL DATABASE

mysql_host				= 'localhost'
mysql_port				= '8080'
mysql_user				= '3dsimuser@localhost'
mysql_password			= '3dsim'
mysql_database			= 'db_3dsim'

table_parrentMapper		= 'parrentMapper'
table_assetsPath		= 'assetsPath'

table_users				= 'users'
table_terrains			= 'terrains'
table_architects		= 'architects'

table_treesPhysical		= 'treesPhysical'
table_treesVertual		= 'treesVertual'
table_trees				= table_treesVertual

table_objectsPhysical	= 'objectsPhysical'
table_objectsVertual	= 'objectsVertual'
table_objects			= table_objectsVertual

assetsPath_view			= []



