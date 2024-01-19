from itertools import groupby
from operator import itemgetter
from db_functions.retrieve_xml_group_by_file import retrieve_xml_group_by_file

from lxml import etree


def retrieve_shape_month(shape, month, singleresult):
    retrieve_info = []
    data = []
    if not singleresult:
        xml = retrieve_xml_group_by_file()
        if xml:
            for xmll in xml:
                root = etree.fromstring(xmll['sub_xml'])
                xpath_expr = f"//Sighting[substring(DateTimeEncounter/Date, 6, 2) = '{month}' and UFOShape = '{shape}']"
                matching_sightings = root.xpath(xpath_expr)
                if matching_sightings:
                    for sighting in matching_sightings:
                        data = {
                            'region': sighting.find("Location/Region").text,
                            'year': sighting.find("DateTimeEncounter/Date").text.split('-')[0],
                            'encounter_duration': sighting.find("EncounterDuration/Text").text,
                            'description': sighting.find("Description").text,
                            'file_name': xmll['file_name'],
                        }
                        retrieve_info.append(data)
            if retrieve_info:
                grouped_info = {key: list(group) for key, group in
                                groupby(retrieve_info, key=itemgetter('file_name'))}
                for key, group in grouped_info.items():
                    grouped_info[key] = sorted(group, key=itemgetter('year'))
                print("Data was successfully retrieved", flush=True)
                return grouped_info
            else:
                print("Unable to retrieve schema", flush=True)
                return data
        else:
            print("Unable to retrieve schema", flush=True)
            return data
    else:
        print("Unable to retrieve schema", flush=True)
        return data
