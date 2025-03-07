import os
import json
from squaremoonpy import google_cloud as gc

sheet = 'Wine celler'
tab = 'Amersfoort'

df = gc.get_spreadsheet(sheet, tab)

#to gc

#save a json
temp_name = 'wine_list.json'
with open (temp_name, 'w') as f:
    json.dump(df, f)

#upload to gc
gc.item_to_google_cloud('squarewine-card', temp_name, temp_name)

os.remove(temp_name)
