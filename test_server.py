import eve
from eve_elastic import Elastic

app = eve.Eve(data=Elastic)
