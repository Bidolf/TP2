from operator import itemgetter

from lxml import etree
from src.server.db_functions.retrieve_xml import retrieve_xml


def get_number_sightings_group_by_year(singleresult):
    data = []
    sightings_by_year = {}
    if not singleresult:
        xml = retrieve_xml()
        if xml:
            for sub_xml in xml:
                count = 0
                years = []
                root = etree.fromstring(sub_xml)

                for sighting in root.xpath('//Sighting'):
                    date_string = sighting.xpath('DateTimeEncounter/Date')[0].text

                    year = int(date_string[:4])

                    if year in sightings_by_year:
                        sightings_by_year[year] += 1
                    else:
                        sightings_by_year[year] = 1

            for year, count in sightings_by_year.items():
                data.append({'year': year, 'count': count})
            if data:
                print("Data was successfully retrieved", flush=True)
                return sorted(data, key=itemgetter('year'))
            else:
                print("Unable to retrieve schema", flush=True)
                return data
        else:
            print("Unable to retrieve schema", flush=True)
            return data
    else:
        print("Unable to retrieve schema", flush=True)
        return data
